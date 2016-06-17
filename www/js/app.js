/**
 * Get week number in the year.
 * @param  {Integer} [weekStart=0]  First day of the week. 0-based. 0 for Sunday, 6 for Saturday.
 * @return {Integer}                0-based number of week.
 */
Date.prototype.getWeek = function(weekStart) {
    var januaryFirst = new Date(this.getFullYear(), 0, 1);
    if(weekStart !== undefined && (typeof weekStart !== 'number' || weekStart % 1 !== 0 || weekStart < 0 || weekStart > 6)) {
      throw new Error('Wrong argument. Must be an integer between 0 and 6.');
    }
    weekStart = weekStart || 0;
    return Math.floor((((this - januaryFirst) / 86400000) + januaryFirst.getDay() - weekStart) / 7);
};
var zeroPad = function (num, places) {
	places = places || 0;
	var zero = places - num.toString().length + 1;
	return Array(+(zero > 0 && zero)).join("0") + num;
}
var makeDayKey = function (dateStr) {
	if (dateStr) {
		var date = new Date(dateStr);
	} else {
		var date = new Date();
	}
	date.setHours(0);
	var dayKey = date.getDate();
	if (date.getMonth() == 6) {
		dayKey += 30;
	}
	return zeroPad(dayKey);
}
var makeDateKey = function (dateStr) {
	if (dateStr) {
		var date = new Date(dateStr);
	} else {
		var date = new Date();
	}
	date.setHours(0);
	return date.toISOString().split('T')[0];
}
var makeWeekKey = function (dateStr) {
	if (dateStr) {
		var date = new Date(dateStr);
	} else {
		var date = new Date();
	}
	date.setHours(0);
	return date.getWeek();
}

angular.module('app', ['ionic', 'app.controllers', 'app.routes', 'app.services', 'app.directives', 'app.filters', 'firebase', 'ngCordova', 'ngStorage', 'angular-filepicker'])
.config(function($sceProvider) {
	$sceProvider.enabled(false);
	//$sce.trustAsHtml('iframe');
})
.config(function(filepickerProvider) {
	filepickerProvider.setKey('ApJiSqcwbSdSBHCN2C6vez');
})
.config(['$localStorageProvider', function ($localStorageProvider) {
	$localStorageProvider.setKeyPrefix('LDSFight');
}])
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
			//ionic.Platform.showStatusBar(false);
			//StatusBar.hide();
			//StatusBar.styleBlackTranslucent();
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
				var userRef = firebase.database().ref().child('users').child(authData.uid);
				userRef.on("value", function(snapshot) {
					//var currentUser = User(authData.uid);
				//currentUser.$loaded().then(function(data) {
					$ionicLoading.hide();
					$rootScope.currentUser = snapshot.val();
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