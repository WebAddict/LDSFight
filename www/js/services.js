angular.module('app.services', [])

.factory("Auth", ["$firebaseAuth", function($firebaseAuth) {
	var ref = firebase.database().ref();
	return $firebaseAuth(ref);
}])

.factory('Users', ["$firebaseArray", function ($firebaseArray) {
	var users = firebase.database().ref().child('users');
	return {
		all: function () {
			return $firebaseArray(users);
		},
		get: function (userId) {
			// Simple index lookup
			return users.$getRecord(userId);
		}
	}
}])
.factory('User', ["$firebaseObject", function ($firebaseObject) {
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

.factory('Lessons', ["$firebaseObject", "$firebaseArray", function ($firebaseObject, $firebaseArray) {
	var lessons = firebase.database().ref().child('lessons');
	var lessonslist = $firebaseArray(lessons);
	return {
		all: function () {
			return lessonslist;
		},
		get: function (lessonId) {
			var record = lessons.child(lessonId);
			if (record) {
				var lesson =  $firebaseObject(record);
				if (lesson.dateStart) {
					lesson.dateStartObj = new Date(lesson.dateStartObj);
				}
				return lesson;
			} else {
				return "fail " + memorizeId;
			}
		},
		current: function () {
			var query = lessons.orderByKey().limitToLast(25);
			return $firebaseArray(query);
		}
	}
}])
.factory('Rewards', ["$firebaseObject", "$firebaseArray", function ($firebaseObject, $firebaseArray) {
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
		}
	}
}])
.factory('Memorize', ["$firebaseObject", "$firebaseArray", function ($firebaseObject, $firebaseArray) {
	var memorize = firebase.database().ref().child('memorize');
	var memorizelist = $firebaseArray(memorize);
	return {
		all: function () {
			return memorizelist;
		},
		get: function (memorizeId) {
			var record = memorize.child(memorizeId);
			if (record) {
				return $firebaseObject(record);
			} else {
				return "fail " + memorizeId;
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
				return "fail " + missionaryId;
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
				return "fail " + feedId;
			}
		}
	}
}])

.service('BlankService', [function(){

}]);

