angular.module('app.services', [])

.factory('BlankFactory', [function(){

}])

.factory('Users', function () {
	var users = [];
	var usersRef = firebase.database().ref('users');
	usersRef.on('value', function(data) {
		users = data.val();
	});
	usersRef.on('child_added', function(data) {
		//users.push(data.val());
		//addCommentElement(postElement, data.key, data.val().text, data.val().author);
	});
	usersRef.on('child_changed', function(data) {
		//users.push(data.val());
		//addCommentElement(postElement, data.key, data.val().text, data.val().author);
	});
	usersRef.on('child_removed', function(data) {
		//users.push(data.val());
	});
	usersRef.on('child_moved', function(data) {
	});
	return {
		all: function () {
			//console.log(users);
			return users;
		},
		get: function (userId) {
			// Simple index lookup
			return users.$getRecord(userId);
		}
	}
})
.factory('Rewards', function () {
	var rewards = {};
	var rewardsRef = firebase.database().ref('rewards');
	rewardsRef.on('value', function(data) {
		rewards = data.val();
	});
	rewardsRef.on('child_added', function(data) {
		//rewards.push(data.val());
	});
	return {
		all: function () {
			return rewards;
		}
	}
})
.factory('RewardDetail', function () {
	return {
		get: function (rewardId) {
			// Simple index lookup
			var rewardDetailRef = firebase.database().ref('rewards/' + rewardId);
			return rewardDetailRef;
		}
	}
})

.service('BlankService', [function(){

}]);

