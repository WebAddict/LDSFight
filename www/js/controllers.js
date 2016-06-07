angular.module('app.controllers', [])

.controller('LoginCtrlNew', ["Auth", function($scope, $state, $ionicPopup, $location, $ionicModal, $ionicLoading, $rootScope, Auth) {
	$ionicModal.fromTemplateUrl('templates/signup.html?v=66d545', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal){
		$scope.modal = modal;
	});

	$scope.loginTwitter = function(user){
		var provider = new Auth.TwitterAuthProvider();
		Auth.$signInWithRedirect(provider).then(function(result) {
		// User signed in!
		var uid = result.user.uid;
		}).catch(function(error) {
		// An error occurred
		});
	}
}])

.controller('LoginCtrl', function($scope, $state, $ionicPopup, $location, $ionicModal, $ionicLoading, $rootScope, $firebaseAuth) {
	$ionicModal.fromTemplateUrl('templates/signup.html?v=66d545', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal){
		$scope.modal = modal;
	});
	$scope.showsociallogin = false;

	$scope.logIn = function(user){
		if (user && user.email && user.pwdForLogin) {
			$ionicLoading.show({template: 'Signing in...'});

			$rootScope.authObj.$signInWithEmailAndPassword(user.email, user.pwdForLogin).catch(function(error){
				console.log(error);
				var errorMessage = error.message;
				var errorCode = error.code;

				if (error) {
					$ionicLoading.hide();
					$ionicPopup.alert({
						template: errorMessage,
						title: 'LOGIN FAILED',
						buttons: [{
							type: 'button-assertive',
							text: '<b>Ok</b>'
						}]
					});
					//user.email = '';
					user.pwdForLogin = '';
				}

			});
		} else {
			$ionicLoading.hide();
			$ionicPopup.alert({
				template: 'Please Check Credentials.',
				title: 'LOGIN FAILED',
				buttons: [{
					type: 'button-assertive',
					text: '<b>Ok<b>'
				}]
			});
		}
	}
	$scope.loginFacebook = function(user){
		var provider = new firebase.auth.FacebookAuthProvider();
		provider.addScope('public_profile');
		provider.addScope('user_friends');
		provider.addScope('email');
		//auth.signInWithPopup(provider).then(function(result) {
		// User signed in!
		//var uid = result.user.uid;
		//}).catch(function(error) {
		// An error occurred
		//});
		$rootScope.authObj.$signInWithRedirect(provider).then(function(authData) {
			//$rootScope.authData = authData;
			//console.log("Logged in as:", authData.uid);
		}).catch(function(error) {
			if (error.code === 'TRANSPORT_UNAVAILABLE') {
				$rootScope.authObj.$signInWithPopup(provider).then(function(authData) {
				});
			} else {
				console.log(error);
			}
		});
	}
	$scope.loginGoogle = function(user){
		var provider = new firebase.auth.GoogleAuthProvider();
		provider.addScope('https://www.googleapis.com/auth/plus.login');
		$rootScope.authObj.$signInWithRedirect(provider).then(function(result) {
			//$rootScope.authData = authData;
			var token = result.credential.accessToken;
			$rootScope.currentUser = result.user;
			//console.log("Logged in as:", authData.uid);
		}).catch(function(error) {
			if (error.code === 'TRANSPORT_UNAVAILABLE') {
				$rootScope.authObj.$signInWithPopup(provider).then(function(authData) {
				});
			} else {
				console.log(error);
			}
		});
	}
	$scope.loginTwitter = function(user){
		//var auth = firebase.auth();
		//var provider = new $rootScope.authObj.TwitterAuthProvider();
		$rootScope.authObj.$signInWithRedirect("twitter").then(function(authData) {
			//$rootScope.authData = authData;
			//console.log("Logged in as:", authData.uid);
		}).catch(function(error) {
			console.error("Authentication failed:", error);
		});
		//auth.signInWithPopup(provider).then(function(result) {
		// User signed in!
		//var uid = result.user.uid;
		//}).catch(function(error) {
		// An error occurred
		//});
	}

	$scope.signUp = function(user){
		if (user && user.email && user.password) {
			$ionicLoading.show({template: 'Creating account...'});
			$scope.modal.hide();

			$rootScope.authObj.$createUserWithEmailAndPassword(user.email, user.password)
			.then(function(userData) {
				// user has been created
			})
			.catch(function(error){
				var errorCode = error.code;
				var errorMessage = error.message;

				if (error) {
					$ionicLoading.hide();

					$ionicPopup.alert({
						template: errorMessage,
						title: 'REGISTRATION FAILED',
						buttons: [{
							type: 'button-assertive',
							text: '<b>Ok</b>'
						}]
					});

					//user.email = '';
					user.password = '';
				}

			});
		}
	}
})

.controller('feedCtrl', function($scope, Feed) {
	$scope.date = new Date();
	$scope.predicate = 'day';
	$scope.reverse = true;
	$scope.feedlist = Feed.all();
	$scope.doRefresh = function() {
		$scope.feedlist = Feed.all();
		$scope.$broadcast('scroll.refreshComplete');
	}
	$scope.order = function(predicate) {
		$scope.predicate = predicate;
		$scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
	};
})

.controller('rewardsCtrl', function($scope, Rewards) {
	$scope.rewards = Rewards.all();
	$scope.doRefresh = function() {
		$scope.rewards = Rewards.all();
		$scope.$broadcast('scroll.refreshComplete');
	}
})

.controller('rewardsDetailCtrl', function($scope, $stateParams, Rewards) {
	$scope.reward = Rewards.get($stateParams.rewardId);
	$scope.doRefresh = function() {
		$scope.reward = Rewards.get($stateParams.rewardId);
		$scope.$broadcast('scroll.refreshComplete');
	}
})

.controller('missionariesCtrl', function($scope, Missionaries) {
	$scope.predicate = 'lastName';
	$scope.reverse = false;
	$scope.missionaries = Missionaries.all();
	$scope.doRefresh = function() {
		$scope.missionaries = Missionaries.all();
		$scope.$broadcast('scroll.refreshComplete');
	}
	$scope.order = function(predicate) {
		$scope.predicate = predicate;
		$scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
		//$scope.lessons = orderBy($scope.lessons, predicate, $scope.reverse);
	};
})

.controller('missionariesDetailCtrl', function($scope, $stateParams, Missionaries) {
	$scope.missionary = Missionaries.get($stateParams.missionaryId);
	$scope.doRefresh = function() {
		$scope.missionary = Missionaries.get($stateParams.missionaryId);
		$scope.$broadcast('scroll.refreshComplete');
	}
})

.controller('goalsCtrl', function($scope) {
	$scope.doRefresh = function() {
		$scope.$broadcast('scroll.refreshComplete');
	}

})

.controller('accountCtrl', function($scope, $rootScope) {
	$scope.doSignOut = function(){
		$rootScope.authObj.$signOut();
	}
	$scope.hello = "Hello World";
	$scope.doRefresh = function() {
		console.log($rootScope.authData);
		$scope.$broadcast('scroll.refreshComplete');
	}
})

.controller('usersCtrl', function($scope, $stateParams, Users) {
	$scope.users = Users.all();
	$scope.doRefresh = function() {
		$scope.users = Users.all();
		$scope.$broadcast('scroll.refreshComplete');
	}
})

.controller('userDetailCtrl', function($scope, $stateParams, User) {
	$scope.user = User($stateParams.userId);
	$scope.doRefresh = function() {
		$scope.user = User($stateParams.userId);
		console.log($stateParams.userId);
		$scope.$broadcast('scroll.refreshComplete');
	}
})

.controller('lessonsCtrl', function($scope, Lessons) {
	$scope.date = new Date();
	$scope.predicate = 'day';
	$scope.reverse = true;
	$scope.lessons = Lessons.all();
	$scope.doRefresh = function() {
		$scope.lessons = Lessons.all();
		$scope.$broadcast('scroll.refreshComplete');
	}
	$scope.order = function(predicate) {
		$scope.predicate = predicate;
		$scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
		//$scope.lessons = orderBy($scope.lessons, predicate, $scope.reverse);
	};
})

.controller('lessonsDetailCtrl', function($scope, $stateParams, Lessons) {
	$scope.date = new Date();
	$scope.lesson = Lessons.get($stateParams.lessonId);
	$scope.doRefresh = function() {
		$scope.lesson = Lessons.get($stateParams.lessonId);
		$scope.$broadcast('scroll.refreshComplete');
	}
})

.controller('memorizeCtrl', function($scope, Memorize) {
	$scope.date = new Date();
	$scope.predicate = 'day';
	$scope.reverse = true;
	$scope.memorizelist = Memorize.all();
	$scope.doRefresh = function() {
		$scope.memorizelist = Memorize.all();
		$scope.$broadcast('scroll.refreshComplete');
	}
	$scope.order = function(predicate) {
		$scope.predicate = predicate;
		$scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
		$scope.lessons = orderBy($scope.lessons, predicate, $scope.reverse);
	};
})

.controller('memorizeDetailCtrl', function($scope, $stateParams, Memorize, $ionicPopup) {
	$scope.date = new Date();
	$scope.memorize = Memorize.get($stateParams.memorizeId);
	$scope.disabledcheckbox = false;
	$scope.checkboxchecked = false;
	$scope.change = function() {
		//$scope.checkbox = false;
		//$scope.disabledcheckbox = true;
		$ionicPopup.alert({
			template: "You cannot award yourself these points, only your leader can.",
			title: 'Check with your leader',
			buttons: [{
				type: 'button-assertive',
				text: '<b>Ok</b>'
			}]
		}).then(function(res) {
			$scope.checkboxchecked = false;
		});
	}
	$scope.doRefresh = function() {
		$scope.memorize = Memorize.get($stateParams.memorizeId);
		$scope.$broadcast('scroll.refreshComplete');
	}
})
