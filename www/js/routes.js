angular.module('app.routes', ['ionicUIRouter'])

.config(function($stateProvider, $urlRouterProvider) {

	// Ionic uses AngularUI Router which uses the concept of states
	// Learn more here: https://github.com/angular-ui/ui-router
	// Set up the various states which the app can be in.
	// Each state's controller can be found in controllers.js
	$stateProvider

	.state('login', {
		url: '/login',
		templateUrl: 'templates/login.html?v=6ms9e',
		controller: 'LoginCtrl'
	})

	.state('tabsController', {
		url: '/tab',
		templateUrl: 'templates/tabsController.html?v=6ms9e',
		abstract:true
	})

	.state('tabsController.account', {
		url: '/account',
		views: {
			'tab-account': {
				templateUrl: 'templates/account.html?v=6ms9e',
				controller: 'accountCtrl'
			}
		}
	})

	.state('tabsController.feed', {
		url: '/feed',
		views: {
			'tab-feed': {
				templateUrl: 'templates/feed.html?v=6ms9e',
				controller: 'feedCtrl'
			}
		}
	})

	.state('tabsController.rewards', {
		url: '/rewards',
		views: {
			'tab-rewards': {
				templateUrl: 'templates/rewards.html?v=6ms9e',
				controller: 'rewardsCtrl'
			}
		}
	})

	.state('tabsController.rewards-detail', {
		url: '/rewards/:rewardId',
		views: {
			'tab-rewards': {
				templateUrl: 'templates/rewards-detail.html?v=6ms9e',
				controller: 'rewardsDetailCtrl'
			}
		}
	})

	.state('tabsController.missionaries', {
		url: '/missionaries',
		views: {
			'tab-missionaries': {
				templateUrl: 'templates/missionaries.html?v=6ms9e',
				controller: 'missionariesCtrl'
			}
		}
	})

	.state('tabsController.missionaries-detail', {
		url: '/missionaries/:missionaryId',
		views: {
			'tab-missionaries': {
				templateUrl: 'templates/missionaries-detail.html?v=6ms9e',
				controller: 'missionariesDetailCtrl'
			}
		}
	})

	.state('tabsController.goals', {
		url: '/goals',
		views: {
			'tab-goals': {
				templateUrl: 'templates/goals.html?v=6ms9e',
				controller: 'goalsCtrl'
			}
		}
	})

	.state('tabsController.users', {
		url: '/users',
		views: {
			'tab-users': {
				templateUrl: 'templates/users.html?v=6ms9e',
				controller: 'usersCtrl'
			}
		}
	})
	.state('tabsController.users-detail', {
		url: '/users/:userId',
		views: {
			'tab-users': {
				templateUrl: 'templates/users-detail.html?v=6ms9e',
				controller: 'userDetailCtrl'
			}
		}
	})

	.state('privacy', {
		url: '/privacy',
		templateUrl: 'templates/privacy.html?v=6ms9e',
		controller: 'feedCtrl'
	})

	.state('tabsController.lessons', {
		url: '/lessons',
		views: {
			'tab-lessons': {
				templateUrl: 'templates/lessons.html?v=6ms9e',
				controller: 'lessonsCtrl'
			}
		}
	})

	.state('tabsController.lessons-detail', {
		url: '/lessons/:lessonId',
		views: {
			'tab-lessons': {
				templateUrl: 'templates/lessons-detail.html?v=6ms9e',
				controller: 'lessonsDetailCtrl'
			}
		}
	})

	.state('tabsController.memorize', {
		url: '/memorize',
		views: {
			'tab-memorize': {
				templateUrl: 'templates/memorize.html?v=6ms9e',
				controller: 'memorizeCtrl'
			}
		}
	})

	.state('tabsController.memorize-detail', {
		url: '/memorize/:memorizeId',
		views: {
			'tab-memorize': {
				templateUrl: 'templates/memorize-detail.html?v=6ms9e',
				controller: 'memorizeDetailCtrl'
			}
		}
	})

	$urlRouterProvider.otherwise('/tab/feed')

});