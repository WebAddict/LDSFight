angular.module('app.controllers', [])

.controller('LoginCtrl', function($scope, $state, $ionicPopup, $location, $ionicModal, $ionicLoading, $rootScope) {
  $ionicModal.fromTemplateUrl('templates/signup.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal){
    $scope.modal = modal;
  });

  $scope.logIn = function(user){
    if (user && user.email && user.pwdForLogin) {
      $ionicLoading.show({template: 'Signing in...'});

      firebase.auth().signInWithEmailAndPassword(user.email, user.pwdForLogin).catch(function(error){
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
  }
  $scope.loginGoogle = function(user){
  }
  $scope.loginTwitter = function(user){
	var auth = firebase.auth();
	var provider = new firebase.auth.TwitterAuthProvider();
	auth.signInWithPopup(provider).then(function(result) {
	// User signed in!
	var uid = result.user.uid;
	}).catch(function(error) {
	// An error occurred
	});
  }

  $scope.signUp = function(user){
    if (user && user.email && user.password) {
      $ionicLoading.show({template: 'Creating account...'});
      $scope.modal.hide();

      firebase.auth().createUserWithEmailAndPassword(user.email, user.password).catch(function(error){
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

.controller('feedCtrl', function($scope) {

})

.controller('rewardsCtrl', function($scope, Rewards) {
	$scope.rewards = Rewards.all();
})

.controller('goalsCtrl', function($scope) {

})

.controller('accountCtrl', function($scope, $rootScope) {
  $scope.logOut = function(){
    firebase.auth().signOut();
  }
  $scope.hello = "Hello World";
})

.controller('usersCtrl', function($scope, Users) {

	$scope.users = Users.all();

})

.controller('lessonsCtrl', function($scope) {

})

.controller('june1FulfillingYourDutyToGodCtrl', function($scope) {

})

.controller('introductionToFIGHTLessonsCtrl', function($scope) {

})

.controller('memorizeCtrl', function($scope) {

})

.controller('2Nephi3120Ctrl', function($scope) {

})

.controller('mosiah733Ctrl', function($scope) {

})

.controller('1Nephi46Ctrl', function($scope) {

})

.controller('alma3737Ctrl', function($scope) {

})

.controller('alma5727Ctrl', function($scope) {

})

.controller('mosiah222Ctrl', function($scope) {

})

.controller('ArmyOfHelamanCtrl', function($scope) {

})

.controller('calledToServeCtrl', function($scope) {

})

.controller('trueToTheFaithCtrl', function($scope) {

})

.controller('comeComeYeSaintsCtrl', function($scope) {

})
