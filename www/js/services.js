angular.module('app.services', [])

.factory('BlankFactory', [function(){

}])

.factory('Users', function () {
	var users = [];
	var usersRef = firebase.database().ref('users');
	usersRef.on('value', function(data) {
	});
	usersRef.on('child_added', function(data) {
		users.push(data.val());
		//addCommentElement(postElement, data.key, data.val().text, data.val().author);
	});
	return {
		all: function () {
			console.log(users);
			return users;
		},
		get: function (userId) {
			// Simple index lookup
			return users.$getRecord(userId);
		}
	}
})
.factory('Rewards', function () {
	var rewards = [];
	var rewardsRef = firebase.database().ref('rewards');
	rewardsRef.on('child_added', function(data) {
		rewards.push(data.val());
	});
	return {
		all: function () {
			return rewards;
		}
	}
})

.service('BlankService', [function(){

}]);

