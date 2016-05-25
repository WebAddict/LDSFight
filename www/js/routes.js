angular.module('app.routes', ['ionicUIRouter'])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
    
  

      .state('tabsController.feed', {
    url: '/feed',
    views: {
      'tab1': {
        templateUrl: 'templates/feed.html',
        controller: 'feedCtrl'
      }
    }
  })

  .state('tabsController.rewards', {
    url: '/rewards',
    views: {
      'tab2': {
        templateUrl: 'templates/rewards.html',
        controller: 'rewardsCtrl'
      }
    }
  })

  .state('tabsController.goals', {
    url: '/goals',
    views: {
      'tab3': {
        templateUrl: 'templates/goals.html',
        controller: 'goalsCtrl'
      }
    }
  })

  .state('tabsController', {
    url: '/page1',
    templateUrl: 'templates/tabsController.html',
    abstract:true
  })

  .state('account', {
    url: '/account',
    templateUrl: 'templates/account.html',
    controller: 'accountCtrl'
  })

  .state('tabsController.lessons', {
    url: '/lessons',
    views: {
      'tab4': {
        templateUrl: 'templates/lessons.html',
        controller: 'lessonsCtrl'
      }
    }
  })

  .state('tabsController.june1FulfillingYourDutyToGod', {
    url: '/lessons.jun1',
    views: {
      'tab4': {
        templateUrl: 'templates/june1FulfillingYourDutyToGod.html',
        controller: 'june1FulfillingYourDutyToGodCtrl'
      }
    }
  })
  .state('tabsController.june2', {
    url: '/lessons.jun2',
    views: {
      'tab4': {
        templateUrl: 'templates/june2.html',
        controller: 'lessonsCtrl'
      }
    }
  })

  /* 
    The IonicUIRouter.js UI-Router Modification is being used for this route.
    To navigate to this route, do NOT use a URL. Instead use one of the following:
      1) Using the ui-sref HTML attribute:
        ui-sref='tabsController.introductionToFIGHTLessons'
      2) Using $state.go programatically:
        $state.go('tabsController.introductionToFIGHTLessons');
    This allows your app to figure out which Tab to open this page in on the fly.
    If you're setting a Tabs default page or modifying the .otherwise for your app and
    must use a URL, use one of the following:
      /page1/tab1/lessons.intro
      /page1/tab4/lessons.intro
  */
  .state('tabsController.introductionToFIGHTLessons', {
    url: '/lessons.intro',
    views: {
      'tab1': {
        templateUrl: 'templates/introductionToFIGHTLessons.html',
        controller: 'introductionToFIGHTLessonsCtrl'
      },
      'tab4': {
        templateUrl: 'templates/introductionToFIGHTLessons.html',
        controller: 'introductionToFIGHTLessonsCtrl'
      }
    }
  })

  .state('tabsController.memorize', {
    url: '/memorize',
    views: {
      'tab5': {
        templateUrl: 'templates/memorize.html',
        controller: 'memorizeCtrl'
      }
    }
  })

  .state('tabsController.2Nephi3120', {
    url: '/memorize.scrip1',
    views: {
      'tab5': {
        templateUrl: 'templates/2Nephi3120.html',
        controller: '2Nephi3120Ctrl'
      }
    }
  })

  .state('tabsController.mosiah733', {
    url: '/memorize.scrip2',
    views: {
      'tab5': {
        templateUrl: 'templates/mosiah733.html',
        controller: 'mosiah733Ctrl'
      }
    }
  })

  .state('tabsController.1Nephi46', {
    url: '/memorize.scrip3',
    views: {
      'tab5': {
        templateUrl: 'templates/1Nephi46.html',
        controller: '1Nephi46Ctrl'
      }
    }
  })

  .state('tabsController.alma3737', {
    url: '/memorize.scrip4',
    views: {
      'tab5': {
        templateUrl: 'templates/alma3737.html',
        controller: 'alma3737Ctrl'
      }
    }
  })

  .state('tabsController.alma5727', {
    url: '/memorize.scrip5',
    views: {
      'tab5': {
        templateUrl: 'templates/alma5727.html',
        controller: 'alma5727Ctrl'
      }
    }
  })

  .state('tabsController.mosiah222', {
    url: '/memorize.scrip6',
    views: {
      'tab5': {
        templateUrl: 'templates/mosiah222.html',
        controller: 'mosiah222Ctrl'
      }
    }
  })

  .state('tabsController.ArmyOfHelaman', {
    url: '/memorize.song1',
    views: {
      'tab5': {
        templateUrl: 'templates/ArmyOfHelaman.html',
        controller: 'ArmyOfHelamanCtrl'
      }
    }
  })

  .state('tabsController.calledToServe', {
    url: '/memorize.song2',
    views: {
      'tab5': {
        templateUrl: 'templates/calledToServe.html',
        controller: 'calledToServeCtrl'
      }
    }
  })

  .state('tabsController.trueToTheFaith', {
    url: '/memorize.song3',
    views: {
      'tab5': {
        templateUrl: 'templates/trueToTheFaith.html',
        controller: 'trueToTheFaithCtrl'
      }
    }
  })

  .state('tabsController.comeComeYeSaints', {
    url: '/memorize.song4',
    views: {
      'tab5': {
        templateUrl: 'templates/comeComeYeSaints.html',
        controller: 'comeComeYeSaintsCtrl'
      }
    }
  })

$urlRouterProvider.otherwise('/page1/feed')

  

});