angular.module('app.services', [])

.factory("Auth", ["$firebaseAuth", function($firebaseAuth) {
	var ref = firebase.database().ref();
	return $firebaseAuth(ref);
}])

.factory('Users', ["$firebaseArray", function ($firebaseArray, $rootScope) {
	var usersRef = firebase.database().ref().child('users');
	var userListRef = firebase.database().ref().child('userList');
	return {
		all: function () {
			return $firebaseArray(userListRef.orderByChild("lastName"));
		},
		reSyncList: function () {
			usersRef.once("value").then(function(usersSnapshot) {
				usersSnapshot.forEach(function(childSnapshot) {
					var userInfo = childSnapshot.val();
					// check to make sure isARWard is turned on
					if (userInfo.groups && (userInfo.groups['leaders'] || userInfo.groups['deacons'] || userInfo.groups['teachers'] || userInfo.groups['priests'] || userInfo.groups['adults'] || userInfo.groups['parents']) && !userInfo.isARWard && childSnapshot.key) {
						usersRef.child(childSnapshot.key).child('isARWard').set(true);
					}
					// Sync userList
					var thisUser = {};
					if (userInfo.avatarUrl && userInfo.avatarUrl != 'img/blank_avatar.png') {
						thisUser.avatarUrl = userInfo.avatarUrl;
					}
					if (userInfo.dateRegistered) {
						thisUser.dateRegistered = userInfo.dateRegistered;
					}
					if (userInfo.displayName) {
						thisUser.displayName = userInfo.displayName;
					}
					if (userInfo.firstName) {
						thisUser.firstName = userInfo.firstName;
					}
					if (userInfo.groups) {
						thisUser.groups = userInfo.groups;
					}
					if (userInfo.lastName) {
						thisUser.lastName = userInfo.lastName;
					}
					if (userInfo.pointsTotal) {
						thisUser.pointsTotal = userInfo.pointsTotal;
					}
					if (userInfo.indexingPoints) {
						thisUser.indexingPoints = userInfo.indexingPoints;
					}
					userListRef.child(childSnapshot.key).set(thisUser);
				});
			});
		},
		get: function (userId) {
			// Simple index lookup
			//return usersRef.$getRecord(userId);
			var userRef = usersRef.child(userId);
			userRef.once("value", function(snapshot) {
				//console.log(snapshot.val());
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
		var userRef = firebase.database().ref().child('users').child(uid);
		if (!userRef) {
			return 0;
		}
		pointsTotal = 0;
		pointTypes = {
			scripturePoints: 0,
			lessonPoints: 0,
			journalPoints: 0,
			dutyToGodPoints: 0,
			templePoints: 0,
			testimonyPoints: 0,
			scoutingPoints: 0,
			missionPrepPoints: 0,
			socialPoints: 0,
			indexingPoints: 0,
			missionaryPoints: 0,
			friendToChurchPoints: 0,
			friendToActivityPoints: 0,
			classroomPoints: 0
		}
		var userInfo = null;
		userRef.once("value", function(userSnapshot) {
			userInfo = userSnapshot.val();
			userSnapshot.child('points').forEach(function(pointSnapshot) {
				//console.log(pointSnapshot.val());
				var pointInfo = pointSnapshot.val();
				pointsTotal += pointInfo.pointValue;

				if (pointInfo.type && pointInfo.type == 'scriptures' && pointInfo.pointValue && pointInfo.pointValue != 0) {
					pointTypes.scripturePoints += pointInfo.pointValue;
				} else if (pointInfo.type && (pointInfo.type == 'lesson' || pointInfo.type == 'bonus' || pointInfo.type == 'challenge') && pointInfo.pointValue && pointInfo.pointValue != 0) {
					pointTypes.lessonPoints += pointInfo.pointValue;
				} else if (pointInfo.type && pointInfo.type == 'journal' && pointInfo.pointValue && pointInfo.pointValue != 0) {
					pointTypes.journalPoints += pointInfo.pointValue;
				} else if (pointInfo.type && pointInfo.type == 'dutyToGod' && pointInfo.pointValue && pointInfo.pointValue != 0) {
					pointTypes.dutyToGodPoints += pointInfo.pointValue;
				} else if (pointInfo.type && pointInfo.type == 'temple' && pointInfo.pointValue && pointInfo.pointValue != 0) {
					pointTypes.templePoints += pointInfo.pointValue;
				} else if (pointInfo.type && pointInfo.type == 'testimony' && pointInfo.pointValue && pointInfo.pointValue != 0) {
					pointTypes.testimonyPoints += pointInfo.pointValue;
				} else if (pointInfo.type && pointInfo.type == 'scouting' && pointInfo.pointValue && pointInfo.pointValue != 0) {
					pointTypes.scoutingPoints += pointInfo.pointValue;
				} else if (pointInfo.type && pointInfo.type == 'missionPrep' && pointInfo.pointValue && pointInfo.pointValue != 0) {
					pointTypes.missionPrepPoints += pointInfo.pointValue;
				} else if (pointInfo.type && pointInfo.type == 'social' && pointInfo.pointValue && pointInfo.pointValue != 0) {
					pointTypes.socialPoints += pointInfo.pointValue;
				} else if (pointInfo.type && pointInfo.type == 'indexing' && pointInfo.pointValue && pointInfo.pointValue != 0) {
					pointTypes.indexingPoints += pointInfo.pointValue;
				} else if (pointInfo.type && pointInfo.type == 'missionary' && pointInfo.pointValue && pointInfo.pointValue > 0) {
					pointTypes.missionaryPoints += pointInfo.pointValue;
				} else if (pointInfo.type && pointInfo.type == 'friendToChurch' && pointInfo.pointValue && pointInfo.pointValue != 0) {
					pointTypes.friendToChurchPoints += pointInfo.pointValue;
				} else if (pointInfo.type && pointInfo.type == 'friendToActivity' && pointInfo.pointValue && pointInfo.pointValue != 0) {
					pointTypes.friendToActivityPoints += pointInfo.pointValue;
				} else if (pointInfo.type && pointInfo.type == 'classroom' && pointInfo.pointValue && pointInfo.pointValue != 0) {
					pointTypes.classroomPoints += pointInfo.pointValue;
				}

			});
		});
		console.log("Calculated " + pointsTotal + " points");
		angular.forEach(pointTypes, function(points, pointType) {
			console.log("Calculated " + points + " " + pointType + " points");
			if (!userInfo[pointType]) {
				firebase.database().ref().child('users').child(uid).child(pointType).set(points);
				firebase.database().ref().child('userList').child(uid).child(pointType).set(points);
			}
		});
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
				user.points.registration = {pointValue: 5, date: user.dateRegistered, title: "Registration Points!", type: 'registration'};
				userRef.update({points: user.points});
			}
			if (user && user.points && !user.points.registration) {
				var registration = {pointValue: 5, date: user.dateRegistered, title: "Registration Points!", type: 'registration'};
				userRef.child('points').child('registration').update(registration);
			}
		});
		var userPointsTotal = calcPoints(uid);
		userRef.update({pointsTotal: userPointsTotal});
		firebase.database().ref().child('userList').child(uid).child('pointsTotal').set(userPointsTotal);
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
			if (!pointInfo.assignedByUid && $rootScope.uid != uid) {
				pointInfo.assignedByUid = $rootScope.uid;
			}
			if (!pointInfo.assignedByName && $rootScope.uid != uid) {
				pointInfo.assignedByName = $rootScope.currentUser.displayName;
			}
			pointInfo.timestamp = firebase.database.ServerValue.TIMESTAMP;
			
			firebase.database().ref().child('users').child(uid).child('points').child(key).set(pointInfo).then(function() {
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
					//console.log("snapshot doesn't exist");
					return false;
				} else {
					var exists = snapshot.child(pointId).exists();
					//console.log("snapshot exists, returning " + exists);
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
	var lessonListRef = firebase.database().ref().child('lessonList');

	var lessonslist = $firebaseArray(lessonListRef);
	return {
		all: function () {
			return lessonslist;
		},
		reSyncList: function () {
			lessonsRef.once("value").then(function(lessonsSnapshot) {
				lessonsSnapshot.forEach(function(childSnapshot) {
					var lessonInfo = childSnapshot.val();
					// Sync lessonslist
					var thisLesson = {};
					if (childSnapshot.child("date").exists()) {
						thisLesson.date = lessonInfo.date;
					}
					if (childSnapshot.child("dateStart").exists()) {
						thisLesson.dateStart = lessonInfo.dateStart;
					}
					if (childSnapshot.child("day").exists()) {
						thisLesson.day = lessonInfo.day;
					}
					if (childSnapshot.child("feedImg").exists()) {
						thisLesson.feedImg = lessonInfo.feedImg;
					}
					if (childSnapshot.child("fullTitle").exists()) {
						thisLesson.fullTitle = lessonInfo.fullTitle;
					}
					if (childSnapshot.child("title").exists()) {
						thisLesson.title = lessonInfo.title;
					}
					lessonListRef.child(childSnapshot.key).set(thisLesson);
				});
			});
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
	var rewardsRef = firebase.database().ref().child('rewards');
	rewardsRef.once("value").then(function(rewardsSnapshot) {
		//var userInfo = feedSnapshot.val();
		rewardsSnapshot.forEach(function(childSnapshot) {
			//console.log(childSnapshot.val());
			var rewardInfo = childSnapshot.val();
			if (rewardInfo.dateClaim && !rewardInfo.timestampClaim && childSnapshot.key) {
				var dateObj = new Date(rewardInfo.dateClaim);
				rewardsRef.child(childSnapshot.key).child('timestampClaim').set(dateObj.getTime()); // store UTC milisecond time
			}
		});
	});
	return {
		all: function () {
			return $firebaseArray(rewardsRef);
		},
		get: function (rewardId) {
			var record = rewardsRef.child(rewardId);
			if (record) {
				return $firebaseObject(record);
			} else {
			}
		},
		claim: function (rewardId) {
			var rewardRef = rewardsRef.child(rewardId);
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
									claimedDateTime.setSeconds(0);
									rewardRef.child('claimedDateTime').set(claimedDateTime.toISOString());
									
									var feedObj = {};
									feedObj.title = userInfo.displayName + " just claimed " + rewardInfo.displayName;
									feedObj.type = 'news';
									feedObj.dateTime = claimedDateTime.toISOString();
									feedObj.for = 'all';
									//feedObj.html = "<img src=\"" + rewardInfo.imgSrc + "\" class=\"full-image\">";
									feedObj.html = "<div style=\"background: url(" + rewardInfo.imgSrc + ") no-repeat center; background-size:cover; height: 226px; padding: 10px;\"><div style=\"color: red; text-shadow: 3px 3px 6px #000000;\"><div class=\"pmfont\" style=\"line-height: 56px; font-size: 56px; margin: 12px auto 10px auto; text-align: center;\">CLAIMED!</div></div></div>";
									firebase.database().ref().child('feed').child(rewardId).set(feedObj);

									return true;
								});
							} else {
								//console.log("not enough points, you have: " + userInfo.pointsTotal + ", you need: " + rewardInfo.points);
							}
						}
					});
				});
			} else {
			}
			return false;
		},
		unclaim: function (rewardId) {
			var rewardRef = rewardsRef.child(rewardId);
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
								firebase.database().ref().child('feed').child(rewardId).remove();
								return true;
							});
						}
					});
				});
			} else {
			}
			return false;
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
	var feedRef = firebase.database().ref().child('feed');
	feedRef.once("value").then(function(feedSnapshot) {
		//var userInfo = feedSnapshot.val();
		feedSnapshot.forEach(function(childSnapshot) {
			//console.log(childSnapshot.val());
			var feedItem = childSnapshot.val();
			if (feedItem.dateTime && !feedItem.timestamp && childSnapshot.key) {
				var dateObj = new Date(feedItem.dateTime);
				var offset = dateObj.getTimezoneOffset() * 60 * 1000; // convert minutes to miliseconds

				feedRef.child(childSnapshot.key).child('timestamp').set(dateObj.getTime() - offset);
			}
			if (childSnapshot.key && !childSnapshot.child("isViewable").exists()) {
				feedRef.child(childSnapshot.key).child('isViewable').set(true);
			}
			if (childSnapshot.key && !childSnapshot.child("uid").exists()) {
				feedRef.child(childSnapshot.key).child('uid').set('sRGIklkF2zQ7xYZqh7p1gczZe0J3');
			}
		});
	});
	var feedlist = $firebaseArray(feedRef.orderByChild("timestamp"));
	return {
		all: function () {
			return feedlist;
		},
		get: function (feedId) {
			var record = feedRef.child(feedId);
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

