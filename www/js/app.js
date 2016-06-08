// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('app', ['ionic', 'app.controllers', 'app.routes', 'app.services', 'app.directives', 'firebase'])
.config(function($sceProvider) {
	$sceProvider.enabled(false);
	//$sce.trustAsHtml('iframe');
})
.run(function($ionicPlatform, $ionicLoading, $ionicModal, $rootScope, $ionicPopup, $location, $firebaseAuth, $firebaseObject, $firebaseArray) {
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
	});

	$rootScope.authObj = $firebaseAuth();
	$rootScope.authData = null;
	$rootScope.currentUser = null;

	$rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
		// We can catch the error thrown when the $requireSignIn promise is rejected
		// and redirect the user back to the home page
		if (error === "AUTH_REQUIRED") {
			$location.path('/login');
		}
	});

	$rootScope.authObj.$onAuthStateChanged(function(result){
		var date = new Date();
		var authData = $rootScope.authObj.$getAuth();
		if (authData && authData.uid) {
			//console.log(authData);
			var myuserref = firebase.database().ref().child('users').child(authData.uid);
			var myuserobj = $firebaseObject(myuserref);
			//myuserobj.pretendName = "Hi There";
			//myuserobj.authData = authData;
			if (!myuserobj.displayName && authData.displayName) {
				myuserobj.displayName = authData.displayName;
			}
			if (!myuserobj.email && authData.email) {
				myuserobj.email = authData.email;
			}
			if (!myuserobj.photoURL && authData.photoURL) {
				myuserobj.photoURL = authData.photoURL;
			}
			if (!myuserobj.emailVerified && authData.emailVerified) {
				myuserobj.emailVerified = authData.emailVerified;
			}
			myuserobj.$save().then(function(ref) {
			  //console.log("Saved My User");
			  //console.log(myuserobj);
			  ref.key === myuserobj.$id; // true
			}, function(error) {
			  //console.log("Error:", error);
			});
			var logref = firebase.database().ref().child('logs');
			var list = $firebaseArray(logref);
			list.$add({ uid: authData.uid,  type: 'auth', date: date.toISOString()}).then(function(ref) {
			  var id = ref.key;
			  //console.log("added LOG record with id " + id);
			});
		}
		$ionicLoading.hide();
		if (result && result.user) {
			$rootScope.token = result.credential.accessToken;
			$rootScope.authData = result;
			$rootScope.currentUser = result.user;


			$location.path('/feed');
		} else if (result) {
			$rootScope.authData = result;
			$location.path('/feed');
		} else {
			$location.path('/login');
		}
	});

})