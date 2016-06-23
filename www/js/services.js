angular.module('app.services', [])

.factory("Auth", ["$firebaseAuth", function($firebaseAuth) {
	var ref = firebase.database().ref();
	return $firebaseAuth(ref);
}])

.factory('Users', ["$firebaseArray", function ($firebaseArray) {
	var usersRef = firebase.database().ref().child('users');
	return {
		all: function () {
			return $firebaseArray(usersRef.orderByChild("lastName"));
		},
		get: function (userId) {
			// Simple index lookup
			//return usersRef.$getRecord(userId);
			var userRef = usersRef.child(userId);
			userRef.once("value", function(snapshot) {
				console.log(snapshot.val());
				return snapshot.val();
			});
		}
	}
}])
.factory("UserFactory", ["$firebaseObject", function($firebaseObject) {
	return $firebaseObject.$extend({
		getFullName: function() {
			// concatenate first and last name
			return this.firstName + " " + this.lastName;
		},
		$$defaults: function(snap) {
			this.avatarUrl = this.avatarUrl ? this.avatarUrl : 'img/blank_avatar.png';
		},
		$$updated: function(snap) {
			var changed = $firebaseObject.prototype.$$updated.apply(this, arguments);
			if( !this._counter ) { this._counter = 0; }
			this._counter++;
			return changed;
		}
	});
}])
.factory("User", function(UserFactory) {
	var ref = firebase.database().ref().child("users");
	return function(userId) {
		return new UserFactory(ref.child(userId));
	}
})
.factory('Points', ["$firebaseObject", "$firebaseArray", "$rootScope", function ($firebaseObject, $firebaseArray, $rootScope) {
	var calcPoints = function(uid) {
		if (!uid && !$rootScope.uid) {
			return 0;
		} else if (!uid && $rootScope.uid) {
			uid = $rootScope.uid;
		}
		var userpointsRef = firebase.database().ref().child('users').child(uid).child('points');
		if (!userpointsRef) {
			return 0;
		}
		pointsTotal = 0;
		userpointsRef.once("value", function(snapshot) {
			snapshot.forEach(function(childSnapshot) {
				//console.log(childSnapshot.val());
				var childData = childSnapshot.val();
				pointsTotal += childData.pointValue;
			});
		});
		console.log("Calculated " + pointsTotal + " points");
		return pointsTotal;
	}

	var saveCalcPoints = function(uid) {
		if (!uid) {
			uid = $rootScope.uid;
		}
		var userRef = firebase.database().ref().child('users').child(uid);
		userRef.once("value", function(snapshot) {
			var user = snapshot.val();
			if (user && !user.dateRegistered) {
				user.dateRegistered = "2016-06-10T00:00:00.0Z";
				userRef.update({dateRegistered: user.dateRegistered});
			}
			if (user && !user.points) {
				user.points = {};
				user.points.registration = {pointValue: 5, date: user.dateRegistered, title: "Registration Points!"};
				userRef.update({points: user.points});
			}
			if (user && user.points && !user.points.registration) {
				var registration = {pointValue: 5, date: user.dateRegistered, title: "Registration Points!"};
				userRef.child('points').child('registration').update(registration);
			}
		});
		userRef.update({pointsTotal: calcPoints(uid)});
	}

	return {
		all: function(uid) {
			if (!uid && !$rootScope.uid) {
				return 0;
			} else if (!uid && $rootScope.uid) {
				uid = $rootScope.uid;
			}
			var userpointsRef = firebase.database().ref().child('users').child(uid).child('points');
			var userpointslist = $firebaseArray(userpointsRef.orderByChild("date"));
			if (userpointsRef) {
				return userpointslist;
			} else {
				return false;
			}
		},
		wipe: function(uid) {
			if (!uid && !$rootScope.uid) {
				return 0;
			} else if (!uid && $rootScope.uid) {
				uid = $rootScope.uid;
			}
			firebase.database().ref().child('users').child(uid).child('points').remove();
			saveCalcPoints(uid);
		},
		remove: function(pointId, uid) {
			if (!uid && !$rootScope.uid) {
				return 0;
			} else if (!uid && $rootScope.uid) {
				uid = $rootScope.uid;
			}
			firebase.database().ref().child('users').child(uid).child('points').child(pointId).remove();
			saveCalcPoints(uid);
		},
		calcPoints: function(uid) {
			return calcPoints(uid);
		},
		reCalcPoints: function(uid) {
			saveCalcPoints(uid);
		},
		add: function(pointInfo, uid) {
			if (!uid) {
				uid = $rootScope.uid;
			}
			if (!pointInfo || !pointInfo.type) {
				return false;
			}
			if (!pointInfo.date) {
				pointInfo.date = new Date();
				pointInfo.date.setHours(0);
			}
			if (!pointInfo.key) {
				pointInfo.key = pointInfo.type + pointInfo.date.toISOString().split('T')[0];
			}
			if (typeof pointInfo.date === 'object') {
				pointInfo.date = pointInfo.date.toISOString();
			}
			var key = pointInfo.key;
			if (!pointInfo.dateReported) {
				pointInfo.dateReported = new Date();
				//pointInfo.dateReported.setHours(0);
				pointInfo.dateReported = pointInfo.dateReported.toISOString();
			}
			if (!pointInfo.pointValue) {
				pointInfo.pointValue = 5;
			}
			if (!pointInfo.title) {
				pointInfo.title = null;
			}
			if (!pointInfo.assignedByUid) {
				pointInfo.assignedByUid = null;
			}
			if (!pointInfo.assignedByName) {
				pointInfo.assignedByName = null;
			}
			pointInfo.timestamp = firebase.database.ServerValue.TIMESTAMP;
			
			var userpoints = firebase.database().ref().child('users').child(uid).child('points').child(key);
			userpoints.set(pointInfo).then(function() {
				saveCalcPoints(uid);
			})
		},
		members: function(pointId) {
			var members = points.child(pointId).child('members');
			if (members) {
				var memberslist = $firebaseArray(members);
				return memberslist;
			} else {
				return false;
			}
		},
		checkIsComplete: function (pointId, uid) {
			//console.log("checkIsComplete called for " + pointId + " on user " + uid);
			if (!uid && !$rootScope.uid) {
				return false;
			} else if (!uid && $rootScope.uid) {
				uid = $rootScope.uid;
			}
			var userPointsRef = firebase.database().ref().child('users').child(uid).child('points');
			userPointsRef.once("value").then(function(snapshot) {
				if (!snapshot.exists()) {
					console.log("snapshot doesn't exist");
					return false;
				} else {
					var exists = snapshot.child(pointId).exists();
					console.log("snapshot exists, returning " + exists);
					return exists ? true : false;
				}
			});
		},
		get: function (pointId) {
			if (!uid && !$rootScope.uid) {
				return 0;
			} else if (!uid && $rootScope.uid) {
				uid = $rootScope.uid;
			}
			var userPointsRef = firebase.database().ref().child('users').child(uid).child('points').child(pointId);
			var record = points.child(pointId);
			if (record) {
				var point =  $firebaseObject(record);
				if (point.dateStart) {
					point.dateStartObj = new Date(point.dateStartObj);
				}
				return point;
			} else {
				return false;
			}
		},
		current: function () {
			var query = points.orderByKey().limitToLast(25);
			return $firebaseArray(query);
		}
	}
}])
.factory('Userold', ["$firebaseObject", function ($firebaseObject) {
	var User = $firebaseObject.$extend({
		// these methods exist on the prototype, so we can access the data using `this`
		getFullName: function() {
			return this.firstName + " " + this.lastName;
		}
	});
    return function(userId) {
      var userRef = firebase.database().ref().child("users").child(userId);
      // create an instance of User (the new operator is required)
      return new User(userRef);
    }
}])

.factory("GroupFactory", ["$firebaseObject", function($firebaseObject) {
	return $firebaseObject.$extend({
		getFullName: function() {
			// concatenate first and last name
			return this.firstName + " " + this.lastName;
		},
		$$updated: function(snap) {
			var changed = $firebaseObject.prototype.$$updated.apply(this, arguments);
			if( !this._counter ) { this._counter = 0; }
			this._counter++;
			return changed;
		}
	});
}])
.factory("Group", function(GroupFactory) {
	var ref = firebase.database().ref().child("groups");
	return function(groupId) {
		return new GroupFactory(ref.child(groupId));
	}
})
.factory('Groups', ["$firebaseObject", "$firebaseArray", function ($firebaseObject, $firebaseArray) {
	var groupsRef = firebase.database().ref().child('groups');
	var groupslist = $firebaseArray(groupsRef.orderByChild("dateClaim"));
	return {
		all: function () {
			if (groupsRef) {
				return groupslist;
			} else {
				return false;
			}
		},
		members: function(groupId) {
			var members = groupsRef.child(groupId).child('members');
			if (members) {
				var memberslist = $firebaseArray(members);
				return memberslist;
			} else {
				return false;
			}
		},
		get: function (groupId) {
			var record = groupsRef.child(groupId);
			if (record) {
				var group =  $firebaseObject(record);
				if (group.dateStart) {
					group.dateStartObj = new Date(group.dateStartObj);
				}
				return group;
			} else {
				return false;
			}
		},
		current: function () {
			var query = groupsRef.orderByKey().limitToLast(25);
			return $firebaseArray(query);
		}
	}
}])

.factory('Lessons', ["$firebaseObject", "$firebaseArray", function ($firebaseObject, $firebaseArray) {
	var lessonsRef = firebase.database().ref().child('lessons');
	var lessonslist = $firebaseArray(lessonsRef);
	return {
		all: function () {
			return lessonslist;
		},
		get: function (lessonId) {
			var lessonRef = lessonsRef.child(lessonId);
			if (lessonRef) {
				var lesson =  $firebaseObject(lessonRef);
				if (lesson.dateStart) {
					lesson.dateStartObj = new Date(lesson.dateStartObj);
				}
				return lesson;
			} else {
				return "fail" + memorizeId;
			}
		},
		getActions: function (lessonId) {
			var actions = [];
			var lessonActionsRef = lessonsRef.child(lessonId).child('actions');
			return $firebaseArray(lessonActionsRef.orderByChild("orderBy"));
			if (lessonActionsRef) {
				lessonActionsRef.once("value", function(snapshot) {
					snapshot.forEach(function(childSnapshot) {
						actions.push(childSnapshot.val());
					});
				});
			}
			return actions;
		},
		getAction: function (lessonId, actionId) {
			var actions = [];
			var lessonActionRef = lessonsRef.child(lessonId).child('actions').child(actionId);
			return $firebaseObject(lessonActionRef);
		},
		current: function () {
			var query = lessonsRef.orderByKey().limitToLast(25);
			return $firebaseArray(query);
		}
	}
}])
.factory('Rewards', ["$firebaseObject", "$firebaseArray", "$rootScope", function ($firebaseObject, $firebaseArray, $rootScope) {
	var rewards = firebase.database().ref().child('rewards');
	var rewardslist = $firebaseArray(rewards);
	return {
		all: function () {
			return rewardslist;
		},
		get: function (rewardId) {
			var record = rewards.child(rewardId);
			if (record) {
				return $firebaseObject(record);
			} else {
			}
		},
		claim: function (rewardId) {
			var rewardRef = rewards.child(rewardId);
			if (rewardRef) {
				rewardRef.once("value").then(function(rewardSnapshot) {
					var rewardInfo = rewardSnapshot.val();
					if (rewardInfo.isClaimed) {
						return false;
					}
					if (!rewardInfo.points) {
						return false;
					}
					var userRef = firebase.database().ref().child('users').child($rootScope.uid);
					userRef.once("value").then(function(userSnapshot) {
						var userInfo = userSnapshot.val();
						if (!userInfo.pointsTotal) {
							return false;
						} else {
							var pointsSpent = userInfo.pointsSpent ? userInfo.pointsSpent : 0;
							var pointsAvailable = userInfo.pointsTotal - pointsSpent;
							if (pointsAvailable >= rewardInfo.points) {
								var newPointsSpent = pointsSpent + rewardInfo.points;
								var newPointsAvailable = userInfo.pointsTotal - newPointsSpent;
								rewardRef.child('isClaimed').set(true).then(function() {
									userRef.child('pointsSpent').set(newPointsSpent);
									userRef.child('pointsAvailable').set(newPointsAvailable);
									rewardRef.child('claimedUid').set($rootScope.uid);
									if ($rootScope.currentUser.displayName) {
										rewardRef.child('claimedDisplayName').set($rootScope.currentUser.displayName);
									}
									rewardRef.child('claimedTimestamp').set(firebase.database.ServerValue.TIMESTAMP);
									var claimedDateTime = new Date();
									rewardRef.child('claimedDateTime').set(claimedDateTime.toISOString());
									return true;
								});
							} else {
								console.log("not enough points, you have: " + userInfo.pointsTotal + ", you need: " + rewardInfo.points);
							}
						}
					});
				});
			} else {
			}
		},
		unclaim: function (rewardId) {
			var rewardRef = rewards.child(rewardId);
			if (rewardRef) {
				rewardRef.once("value").then(function(rewardSnapshot) {
					var rewardInfo = rewardSnapshot.val();
					if (!rewardInfo.isClaimed) {
						return false;
					}
					if (rewardInfo.claimedUid != $rootScope.uid) {
						return false;
					}
					var userRef = firebase.database().ref().child('users').child($rootScope.uid);
					userRef.once("value").then(function(userSnapshot) {
						var userInfo = userSnapshot.val();
						if (!userInfo.pointsTotal) {
							return false;
						} else {
							var pointsSpent = userInfo.pointsSpent ? userInfo.pointsSpent : 0;
							var newPointsSpent = pointsSpent - rewardInfo.points;
							var newPointsAvailable = userInfo.pointsTotal - newPointsSpent;
							rewardRef.child('isClaimed').remove().then(function() {
								userRef.child('pointsSpent').set(newPointsSpent);
								userRef.child('pointsAvailable').set(newPointsAvailable);
								rewardRef.child('claimedUid').remove();
								rewardRef.child('claimedDisplayName').remove();
								rewardRef.child('claimedTimestamp').remove();
								rewardRef.child('claimedDateTime').remove();
								return true;
							});
						}
					});
				});
			} else {
			}
		}
	}
}])
.factory('Memorize', ["$firebaseObject", "$firebaseArray", "$rootScope", function ($firebaseObject, $firebaseArray, $rootScope) {
	var memorizeRef = firebase.database().ref().child('memorize');
	var memorizeList = $firebaseArray(memorizeRef);
	return {
		all: function () {
			return memorizeList;
		},
		get: function (memorizeId) {
			var record = memorizeRef.child(memorizeId);
			if (record) {
				return $firebaseObject(record);
			} else {
				return "fail" + memorizeId;
			}
		}
	}
}])
.factory('Missionaries', ["$firebaseObject", "$firebaseArray", function ($firebaseObject, $firebaseArray) {
	var missionaries = firebase.database().ref().child('missionaries');
	var missionarieslist = $firebaseArray(missionaries);
	return {
		all: function () {
			return missionarieslist;
		},
		get: function (missionaryId) {
			var record = missionaries.child(missionaryId);
			if (record) {
				return $firebaseObject(record);
			} else {
				return "fail" + missionaryId;
			}
		}
	}
}])
.factory('Feed', ["$firebaseObject", "$firebaseArray", function ($firebaseObject, $firebaseArray) {
	var feed = firebase.database().ref().child('feed');
	var feedlist = $firebaseArray(feed);
	return {
		all: function () {
			return feedlist;
		},
		get: function (feedId) {
			var record = feed.child(feedId);
			if (record) {
				return $firebaseObject(record);
			} else {
				return "fail" + feedId;
			}
		}
	}
}])
.factory('FeedService',['$http',function($http){
    return {
        parseFeed : function(url){
            return $http.jsonp('https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=50&callback=JSON_CALLBACK&q=' + encodeURIComponent(url));
        }
    }
}])

.service('BlankService', [function(){

}]);

