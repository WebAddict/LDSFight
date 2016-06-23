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
		templateUrl: 'templates/login.html?v=2m6x9',
		controller: 'LoginCtrl'
	})

	.state('tabsController', {
		cache: false,
		url: '/tab',
		templateUrl: 'templates/tabsController.html?v=2m6x9',
		abstract:true
	})

	.state('tabsController.account', {
		cache: false,
		url: '/account',
		views: {
			'tab-account': {
				templateUrl: 'templates/account.html?v=2m6x9',
				controller: 'accountCtrl'
			}
		}
	})

	.state('tabsController.account-daily', {
		url: '/account/daily',
		views: {
			'tab-account': {
				templateUrl: 'templates/daily.html?v=2m6x9',
				controller: 'dailyCtrl'
			}
		}
	})

	.state('tabsController.account-points', {
		url: '/account/points',
		views: {
			'tab-account': {
				templateUrl: 'templates/user-points.html?v=2m6x9',
				controller: 'userPointsCtrl'
			}
		}
	})

	.state('tabsController.account-edit', {
		url: '/account/edit',
		views: {
			'tab-account': {
				templateUrl: 'templates/user-edit.html?v=2m6x9',
				controller: 'userEditCtrl'
			}
		}
	})

	.state('tabsController.feed', {
		url: '/feed',
		views: {
			'tab-feed': {
				templateUrl: 'templates/feed.html?v=2m6x9',
				controller: 'feedCtrl'
			}
		}
	})

	.state('tabsController.feed-lessons-detail', {
		url: '/feed/lessons/:lessonId',
		views: {
			'tab-feed': {
				templateUrl: 'templates/lessons-detail.html?v=2m6x9',
				controller: 'lessonsDetailCtrl'
			}
		}
	})

	.state('tabsController.rewards', {
		url: '/rewards',
		views: {
			'tab-rewards': {
				templateUrl: 'templates/rewards.html?v=2m6x9',
				controller: 'rewardsCtrl'
			}
		}
	})

	.state('tabsController.rewards-detail', {
		url: '/rewards/:rewardId',
		views: {
			'tab-rewards': {
				templateUrl: 'templates/rewards-detail.html?v=2m6x9',
				controller: 'rewardsDetailCtrl'
			}
		}
	})

	.state('tabsController.missionaries', {
		url: '/missionaries',
		views: {
			'tab-missionaries': {
				templateUrl: 'templates/missionaries.html?v=2m6x9',
				controller: 'missionariesCtrl'
			}
		}
	})

	.state('tabsController.missionaries-detail', {
		url: '/missionaries/:missionaryId',
		views: {
			'tab-missionaries': {
				templateUrl: 'templates/missionaries-detail.html?v=2m6x9',
				controller: 'missionariesDetailCtrl'
			}
		}
	})

	.state('tabsController.missionaries-detail-letters', {
		url: '/missionaries/:missionaryId/letters',
		views: {
			'tab-missionaries': {
				templateUrl: 'templates/missionaries-detail-letters.html?v=2m6x9',
				controller: 'missionariesDetailLettersCtrl'
			}
		}
	})

	.state('tabsController.missionaries-detail-letters-detail', {
		url: '/missionaries/:missionaryId/letters/:letterId',
		views: {
			'tab-missionaries': {
				templateUrl: 'templates/missionaries-detail-letters-detail.html?v=2m6x9',
				controller: 'missionariesDetailLettersDetailCtrl'
			}
		}
	})

	.state('tabsController.missionaries-detail-rss', {
		url: '/missionaries/:missionaryId/rss',
		views: {
			'tab-missionaries': {
				templateUrl: 'templates/missionaries-detail-rss.html?v=2m6x9',
				controller: 'missionariesDetailRssCtrl'
			}
		}
	})

	.state('tabsController.missionaries-detail-rss-detail', {
		url: '/missionaries/:missionaryId/rss/:feedId',
		views: {
			'tab-missionaries': {
				templateUrl: 'templates/missionaries-detail-rss-detail.html?v=2m6x9',
				controller: 'missionariesDetailRssDetailCtrl'
			}
		}
	})

	.state('tabsController.goals', {
		url: '/goals',
		views: {
			'tab-goals': {
				templateUrl: 'templates/goals.html?v=2m6x9',
				controller: 'goalsCtrl'
			}
		}
	})

	.state('tabsController.goals-points', {
		url: '/goals/points',
		views: {
			'tab-goals': {
				templateUrl: 'templates/user-points.html?v=2m6x9',
				controller: 'userPointsCtrl'
			}
		}
	})

	.state('tabsController.goals-daily', {
		url: '/goals/daily',
		views: {
			'tab-goals': {
				templateUrl: 'templates/daily.html?v=2m6x9',
				controller: 'dailyCtrl'
			}
		}
	})

	.state('tabsController.users', {
		url: '/users',
		views: {
			'tab-users': {
				templateUrl: 'templates/users.html?v=2m6x9',
				controller: 'usersCtrl'
			}
		}
	})
	.state('tabsController.users-detail', {
		url: '/users/:userId',
		views: {
			'tab-users': {
				templateUrl: 'templates/users-detail.html?v=2m6x9',
				controller: 'userDetailCtrl'
			}
		}
	})

	.state('tabsController.users-detail-edit', {
		url: '/users/:userId/edit',
		views: {
			'tab-users': {
				templateUrl: 'templates/user-edit.html?v=2m6x9',
				controller: 'userEditCtrl'
			}
		}
	})

	.state('tabsController.users-detail-goals', {
		url: '/users/:userId/goals',
		views: {
			'tab-users': {
				templateUrl: 'templates/goals.html?v=2m6x9',
				controller: 'goalsCtrl'
			}
		}
	})

	.state('tabsController.users-detail-daily', {
		url: '/users/:userId/daily',
		views: {
			'tab-users': {
				templateUrl: 'templates/daily.html?v=2m6x9',
				controller: 'dailyCtrl'
			}
		}
	})

	.state('tabsController.users-detail-memorize', {
		url: '/users/:userId/memorize',
		views: {
			'tab-users': {
				templateUrl: 'templates/memorize.html?v=2m6x9',
				controller: 'memorizeCtrl'
			}
		}
	})

	.state('tabsController.users-detail-memorize-detail', {
		url: '/users/:userId/memorize/:memorizeId',
		views: {
			'tab-users': {
				templateUrl: 'templates/memorize-detail.html?v=2m6x9',
				controller: 'memorizeDetailCtrl'
			}
		}
	})

	.state('tabsController.users-detail-points', {
		url: '/users/:userId/points',
		views: {
			'tab-users': {
				templateUrl: 'templates/user-points.html?v=2m6x9',
				controller: 'userPointsCtrl'
			}
		}
	})

	.state('tabsController.users-detail-lessons', {
		url: '/users/:userId/lessons',
		views: {
			'tab-users': {
				templateUrl: 'templates/lessons.html?v=2m6x9',
				controller: 'lessonsCtrl'
			}
		}
	})

	.state('tabsController.users-detail-lessons-detail', {
		url: '/users/:userId/lessons/:lessonId',
		views: {
			'tab-users': {
				templateUrl: 'templates/lessons-detail.html?v=2m6x9',
				controller: 'lessonsDetailCtrl'
			}
		}
	})

	.state('privacy', {
		url: '/privacy',
		templateUrl: 'templates/privacy.html?v=2m6x9',
		controller: 'feedCtrl'
	})

	.state('tabsController.lessons', {
		url: '/lessons',
		views: {
			'tab-lessons': {
				templateUrl: 'templates/lessons.html?v=2m6x9',
				controller: 'lessonsCtrl'
			}
		}
	})

	.state('tabsController.lessons-detail', {
		url: '/lessons/:lessonId',
		views: {
			'tab-lessons': {
				templateUrl: 'templates/lessons-detail.html?v=2m6x9',
				controller: 'lessonsDetailCtrl'
			}
		}
	})

	.state('tabsController.memorize', {
		url: '/memorize',
		views: {
			'tab-memorize': {
				templateUrl: 'templates/memorize.html?v=2m6x9',
				controller: 'memorizeCtrl'
			}
		}
	})

	.state('tabsController.memorize-detail', {
		url: '/memorize/:memorizeId',
		views: {
			'tab-memorize': {
				templateUrl: 'templates/memorize-detail.html?v=2m6x9',
				controller: 'memorizeDetailCtrl'
			}
		}
	})

	$urlRouterProvider.otherwise('/login')

});