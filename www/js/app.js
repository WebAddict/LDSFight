// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('app', ['ionic', 'app.controllers', 'app.routes', 'app.services', 'app.directives', 'app.filters', 'firebase'])
.config(function($sceProvider) {
	$sceProvider.enabled(false);
	//$sce.trustAsHtml('iframe');
})
.run(function($ionicPlatform, $ionicLoading, $ionicModal, $rootScope, $ionicPopup, $location, $firebaseAuth, $firebaseObject, $firebaseArray, $state, $ionicHistory, User) {
	$ionicPlatform.ready(function() {
		// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
		// for form inputs)
		if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
			cordova.plugins.Keyboard.disableScroll(true);
		}
		if (window.StatusBar) {
			// org.apache.cordova.statusbar required
			StatusBar.styleDefault();
		}
		//$rootScope.msg = $ionicHistory.currentView();
		$rootScope.authObj = $firebaseAuth();
		$rootScope.authData = null;
		$rootScope.currentUser = null;
		$rootScope.uid = null;
		$rootScope.defaultAvatarUrl = 'img/blank_avatar.png';

		$rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
			// We can catch the error thrown when the $requireSignIn promise is rejected
			// and redirect the user back to the home page
			if (error === "AUTH_REQUIRED") {
				$ionicHistory.clearHistory();
				$ionicHistory.clearCache();
				$state.go('login');
			}
		});

		$rootScope.authObj.$onAuthStateChanged(function(authData){
			var date = new Date();
			//var authData = $rootScope.authObj.$getAuth();
			if (authData && authData.uid) {
				$rootScope.uid = authData.uid;
				$rootScope.authData = authData;
				var currentUser = User(authData.uid);
				currentUser.$loaded().then(function(data) {
					$ionicLoading.hide();
					$rootScope.currentUser = data;
					//$rootScope.token = result.credential.accessToken;
					
					var currentView = $ionicHistory.currentView();
					if (currentView.url == "/login") {
						$ionicLoading.hide();
						$ionicHistory.clearHistory();
						$ionicHistory.clearCache();
						$state.go('tabsController.feed');
					}
				});
			} else {
				$ionicLoading.hide();
				$ionicHistory.clearHistory();
				$ionicHistory.clearCache();
				$state.go('login');
			}
		});
	});

})