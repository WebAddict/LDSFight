angular.module('app.routes', ['ionicUIRouter'])

.config(function($stateProvider, $urlRouterProvider) {

	// Ionic uses AngularUI Router which uses the concept of states
	// Learn more here: https://github.com/angular-ui/ui-router
	// Set up the various states which the app can be in.
	// Each state's controller can be found in controllers.js
	$stateProvider

	.state('login', {
		cache: false,
		url: '/login',
		templateUrl: 'templates/login.html?v=7d2md',
		controller: 'LoginCtrl'
	})

	.state('tabsController', {
		cache: false,
		url: '/tab',
		templateUrl: 'templates/tabsController.html?v=7d2md',
		abstract:true
	})

	.state('tabsController.account', {
		cache: false,
		url: '/account',
		views: {
			'tab-account': {
				templateUrl: 'templates/account.html?v=7d2md',
				controller: 'accountCtrl'
			}
		}
	})

	.state('tabsController.account-edit', {
		url: '/account/edit',
		views: {
			'tab-account': {
				templateUrl: 'templates/user-edit.html?v=7d2md',
				controller: 'userEditCtrl'
			}
		}
	})

	.state('tabsController.feed', {
		url: '/feed',
		views: {
			'tab-feed': {
				templateUrl: 'templates/feed.html?v=7d2md',
				controller: 'feedCtrl'
			}
		}
	})

	.state('tabsController.feed-lessons-detail', {
		url: '/feed/lessons/:lessonId',
		views: {
			'tab-feed': {
				templateUrl: 'templates/lessons-detail.html?v=7d2md',
				controller: 'lessonsDetailCtrl'
			}
		}
	})

	.state('tabsController.rewards', {
		url: '/rewards',
		views: {
			'tab-rewards': {
				templateUrl: 'templates/rewards.html?v=7d2md',
				controller: 'rewardsCtrl'
			}
		}
	})

	.state('tabsController.rewards-detail', {
		url: '/rewards/:rewardId',
		views: {
			'tab-rewards': {
				templateUrl: 'templates/rewards-detail.html?v=7d2md',
				controller: 'rewardsDetailCtrl'
			}
		}
	})

	.state('tabsController.missionaries', {
		url: '/missionaries',
		views: {
			'tab-missionaries': {
				templateUrl: 'templates/missionaries.html?v=7d2md',
				controller: 'missionariesCtrl'
			}
		}
	})

	.state('tabsController.missionaries-detail', {
		url: '/missionaries/:missionaryId',
		views: {
			'tab-missionaries': {
				templateUrl: 'templates/missionaries-detail.html?v=7d2md',
				controller: 'missionariesDetailCtrl'
			}
		}
	})

	.state('tabsController.goals', {
		url: '/goals',
		views: {
			'tab-goals': {
				templateUrl: 'templates/goals.html?v=7d2md',
				controller: 'goalsCtrl'
			}
		}
	})

	.state('tabsController.users', {
		url: '/users',
		views: {
			'tab-users': {
				templateUrl: 'templates/users.html?v=7d2md',
				controller: 'usersCtrl'
			}
		}
	})
	.state('tabsController.users-detail', {
		url: '/users/:userId',
		views: {
			'tab-users': {
				templateUrl: 'templates/users-detail.html?v=7d2md',
				controller: 'userDetailCtrl'
			}
		}
	})

	.state('tabsController.users-detail-edit', {
		url: '/users/:userId/edit',
		views: {
			'tab-users': {
				templateUrl: 'templates/user-edit.html?v=7d2md',
				controller: 'userEditCtrl'
			}
		}
	})

	.state('tabsController.users-detail-memorize', {
		url: '/users/:userId/memorize',
		views: {
			'tab-users': {
				templateUrl: 'templates/memorize.html?v=7d2md',
				controller: 'memorizeCtrl'
			}
		}
	})

	.state('tabsController.users-detail-memorize-detail', {
		url: '/users/:userId/memorize/:memorizeId',
		views: {
			'tab-users': {
				templateUrl: 'templates/memorize-detail.html?v=7d2md',
				controller: 'memorizeDetailCtrl'
			}
		}
	})

	.state('tabsController.users-detail-points', {
		url: '/users/:userId/points',
		views: {
			'tab-users': {
				templateUrl: 'templates/user-points.html?v=7d2md',
				controller: 'userPointsCtrl'
			}
		}
	})

	.state('tabsController.users-detail-lessons', {
		url: '/users/:userId/lessons',
		views: {
			'tab-users': {
				templateUrl: 'templates/lessons.html?v=7d2md',
				controller: 'lessonsCtrl'
			}
		}
	})

	.state('tabsController.users-detail-lessons-detail', {
		url: '/users/:userId/lessons/:lessonId',
		views: {
			'tab-users': {
				templateUrl: 'templates/lessons-detail.html?v=7d2md',
				controller: 'lessonsDetailCtrl'
			}
		}
	})

	.state('privacy', {
		url: '/privacy',
		templateUrl: 'templates/privacy.html?v=7d2md',
		controller: 'feedCtrl'
	})

	.state('tabsController.lessons', {
		url: '/lessons',
		views: {
			'tab-lessons': {
				templateUrl: 'templates/lessons.html?v=7d2md',
				controller: 'lessonsCtrl'
			}
		}
	})

	.state('tabsController.lessons-detail', {
		url: '/lessons/:lessonId',
		views: {
			'tab-lessons': {
				templateUrl: 'templates/lessons-detail.html?v=7d2md',
				controller: 'lessonsDetailCtrl'
			}
		}
	})

	.state('tabsController.memorize', {
		url: '/memorize',
		views: {
			'tab-memorize': {
				templateUrl: 'templates/memorize.html?v=7d2md',
				controller: 'memorizeCtrl'
			}
		}
	})

	.state('tabsController.memorize-detail', {
		url: '/memorize/:memorizeId',
		views: {
			'tab-memorize': {
				templateUrl: 'templates/memorize-detail.html?v=7d2md',
				controller: 'memorizeDetailCtrl'
			}
		}
	})

	$urlRouterProvider.otherwise('/login')

});