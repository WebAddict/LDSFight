angular.module('app.controllers', [])

.controller('LoginCtrl', function($scope, $state, $ionicHistory, $ionicPopup, $location, $ionicModal, $ionicLoading, $rootScope, $firebaseAuth, User, $firebaseObject) {
	if ($rootScope.uid) {
		$state.go('tabsController.feed');
	}
	$ionicModal.fromTemplateUrl('templates/signup.html?v=9dn27', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal){
		$scope.modal = modal;
	});
	$scope.showsociallogin = true;
	$scope.registerUser = {};

	$scope.toggleARWard = function() {
		if ($scope.registerUser.isARWard) {
			$scope.registerUser.lastName = "bloke";
		} else {
			$scope.registerUser.lastName = "ham";
		}
	}

	$scope.signUp = function(registerUser){
		var missing = [];
		if (!registerUser.firstName) {
			missing.push("First Name");
		}
		if (!registerUser.lastName) {
			missing.push("Last Name");
		}
		if (!registerUser.email) {
			missing.push("Email Address");
		}
		if (!registerUser.password) {
			missing.push("Password");
		}
		if (missing.length > 0) {
			$ionicPopup.alert({
				title: 'Not Ready!',
				content: "Missing: " + missing.join(", ")
			});
		} else {
			$ionicLoading.show({template: 'Creating account...'});

			$rootScope.authObj.$createUserWithEmailAndPassword(registerUser.email, registerUser.password)
			.then(function(firebaseUser) {
				if (firebaseUser && firebaseUser.uid) {
					// user has been created
					var user = User(firebaseUser.uid);
					user.$loaded().then(function(data) {

						user.displayName = registerUser.firstName + " " + registerUser.lastName;
						user.email = registerUser.email;
						user.pointsTotal = 5;
						if (registerUser.firstName) {
							user.firstName = registerUser.firstName;
						}
						if (registerUser.lastName) {
							user.lastName = registerUser.lastName;
						}
						user.groups = {};
						user.points = {};
						user.points.registration = {pointValue: 5, date: new Date().toISOString(), title: "Registration Points!"};
						if (registerUser.isARWard && registerUser.bishop.toLowerCase() == 'cobb') {
							user.isARWard = true;
							if (registerUser.myGroup) {
								user.groups[registerUser.myGroup] = true;
								var myMembersRef = firebase.database().ref().child('groups').child(registerUser.myGroup).child('members').child(firebaseUser.uid);
								if (myMembersRef) {
									var myMembersObj = $firebaseObject(myMembersRef);
									myMembersObj.$loaded().then(function(data) {
										myMembersObj.displayName = registerUser.firstName + " " + registerUser.lastName;
										myMembersObj.$save();
									});
								}
							}
						} else {
							user.groups.visitor = true;
							var myMembersRef = firebase.database().ref().child('groups').child('visitors').child('members').child(firebaseUser.uid);
							if (myMembersRef) {
								var myMembersObj = $firebaseObject(myMembersRef);
								myMembersObj.$loaded().then(function(data) {
									myMembersObj.displayName = registerUser.firstName + " " + registerUser.lastName;
									myMembersObj.$save();
								});
							}
						}
						user.dateRegistered = new Date().toISOString();
						user.lastOnline = new Date().toISOString();
						user.avatarUrl = $rootScope.defaultAvatarUrl;
						user.$save().then(function(ref) {
							$scope.modal.hide();
							$ionicLoading.hide();
							// created user, now update groups
							$state.go('tabsController.feed');
						}, function(error) {
							$scope.modal.hide();
							$ionicLoading.hide();
							console.log("Error:", error);
							$state.go('tabsController.feed');
						});
					});
				} else {
					$ionicLoading.hide();

					$ionicPopup.alert({
						template: "Should have captured info to DB, but didn't... sorry",
						title: 'Missed Account Details',
						buttons: [{
							type: 'button-assertive',
							text: '<b>Ok</b>'
						}]
					}).then(function(res) {
						$scope.modal.hide();
						$ionicLoading.hide();
						$state.go('tabsController.feed');
					});
				}
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
					//user.password = '';
				}

			});
		}
	}

	$scope.logIn = function(loginUser){
		if (loginUser && loginUser.email && loginUser.pwdForLogin) {
			$ionicLoading.show({template: 'Signing in...'});

			$rootScope.authObj.$signInWithEmailAndPassword(loginUser.email, loginUser.pwdForLogin)
			.then(function(result) {
				loginUser.email = '';
				loginUser.pwdForLogin = '';
				$ionicLoading.hide();
				$ionicHistory.clearHistory();
				$ionicHistory.clearCache();
				$state.go('tabsController.feed');
			})
			.catch(function(error){
				//console.log(error);
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
					//loginUser.email = '';
					loginUser.pwdForLogin = '';
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
		$rootScope.authObj.$signInWithRedirect(provider)
			.then(function(authData) {
				//$rootScope.authData = authData;
				//console.log("Logged in as:", authData.uid);
				$location.path('/feed');
			}).catch(function(error) {
				if (error.code === 'TRANSPORT_UNAVAILABLE') {
					$rootScope.authObj.$signInWithPopup(provider).then(function(authData) {
					});
				} else {
					//console.log(error);
				}
			});
	}
	$scope.loginGoogle = function(user){
		var provider = new firebase.auth.GoogleAuthProvider();
		provider.addScope('https://www.googleapis.com/auth/plus.login');
		$rootScope.authObj.$signInWithRedirect(provider)
			.then(function(result) {
				//$rootScope.authData = authData;
				var token = result.credential.accessToken;
				$rootScope.currentUser = result.user;
				//console.log("Logged in as:", authData.uid);
				$location.path('/feed');
			}).catch(function(error) {
				if (error.code === 'TRANSPORT_UNAVAILABLE') {
					$rootScope.authObj.$signInWithPopup(provider).then(function(authData) {
					});
				} else {
					//console.log(error);
				}
			});
	}
	$scope.loginTwitter = function(user){
		//var auth = firebase.auth();
		var provider = new firebase.auth.TwitterAuthProvider();
		$rootScope.authObj.$signInWithRedirect(provider)
			.then(function(authData) {
				//$rootScope.authData = authData;
				//console.log("Logged in as:", authData.uid);
				$location.path('/feed');
			}).catch(function(error) {
				if (error.code === 'TRANSPORT_UNAVAILABLE') {
					$rootScope.authObj.$signInWithPopup(provider).then(function(authData) {
					});
				} else {
					//console.log(error);
				}
			});
	}
	$scope.forgotPass = function(user) {
		// sendPasswordResetEmail
		if (user && user.email) {
			$ionicLoading.show({template: 'Loading...'});
			$rootScope.authObj.$sendPasswordResetEmail(user.email).then(function() {
				$ionicLoading.hide();
				$ionicPopup.alert({
					template: "Password reset email sent successfully to " + user.email + "!",
					title: 'SENT EMAIL',
					buttons: [{
						type: 'button-balanced',
						text: '<b>Ok</b>'
					}]
				});
			}).catch(function(error) {
				if (error) {
					$ionicLoading.hide();
					$ionicPopup.alert({
						template: error.message,
						title: 'FORGOT PASSWORD FAILED',
						buttons: [{
							type: 'button-assertive',
							text: '<b>Ok<b>'
						}]
					});
					console.error("Error: ", error);
				}
			});
		} else {
			$ionicLoading.hide();
			$ionicPopup.alert({
				template: 'Please Enter Email.',
				title: 'FORGOT PASSWORD FAILED',
				buttons: [{
					type: 'button-assertive',
					text: '<b>Ok<b>'
				}]
			});
		}
	}
})

.controller('accountCtrl', function($scope, $rootScope, $state, $location, User, Groups, $firebaseObject, $ionicHistory, $ionicPopup, Points) {
	$scope.doSignOut = function(){
		$rootScope.authData = null;
		$rootScope.currentUser = null;
		$rootScope.uid = null;
		$rootScope.authObj.$signOut();
		$ionicHistory.clearHistory();
		$ionicHistory.clearCache();
		$state.go('login');
	}
	if (!$rootScope.uid) {
		$ionicHistory.clearHistory();
		$ionicHistory.clearCache();
		$state.go('login');
	}
	var user = User($rootScope.uid);
	user.$loaded().then(function(data) {
		//$scope.user = user;
		data.$bindTo($scope, "user").then(function() {
			if (data.firstName && data.lastName) {
				$scope.user.displayName = data.firstName + " " + data.lastName;
			} else if (data.firstName) {
				$scope.user.displayName = data.firstName;
			} else if (data.lastName) {
				$scope.user.displayName = data.lastName;
			} else if (data.email) {
				$scope.user.displayName = data.email;
			} else {
				$scope.user.displayName = "";
			}
			//$scope.user.foo = "baz";  // will be saved to the database
			//ref.set({ foo: "baz" });  // this would update the database and $scope.data
		});
		var unwatch = data.$watch(function() {
			if ($scope.user.firstName && $scope.user.lastName) {
				$scope.user.displayName = $scope.user.firstName + " " + $scope.user.lastName;
			} else if ($scope.user.firstName) {
				$scope.user.displayName = $scope.user.firstName;
			} else if ($scope.user.lastName) {
				$scope.user.displayName = $scope.user.lastName;
			} else if ($scope.user.email) {
				$scope.user.displayName = $scope.user.email;
			} else {
				$scope.user.displayName = "";
			}
			
			var myDeaconsMembersRef = firebase.database().ref().child('groups').child('deacons').child('members').child($rootScope.uid);
			if (myDeaconsMembersRef) {
				var myDeaconsMembersObj = $firebaseObject(myDeaconsMembersRef);
				if ($scope.user && $scope.user.groups && $scope.user.groups.deacons) {
					myDeaconsMembersObj.displayName = $scope.user.displayName;
					myDeaconsMembersObj.$save();
				} else {
					myDeaconsMembersObj.$remove();
				}
			}
			
			var myTeachersMembersRef = firebase.database().ref().child('groups').child('teachers').child('members').child($rootScope.uid);
			if (myTeachersMembersRef) {
				var myTeachersMembersObj = $firebaseObject(myTeachersMembersRef);
				if ($scope.user && $scope.user.groups && $scope.user.groups.teachers) {
					myTeachersMembersObj.displayName = $scope.user.displayName;
					myTeachersMembersObj.$save();
				} else {
					myTeachersMembersObj.$remove();
				}
			}
			
			var myPriestsMembersRef = firebase.database().ref().child('groups').child('priests').child('members').child($rootScope.uid);
			if (myPriestsMembersRef) {
				var myPriestsMembersObj = $firebaseObject(myPriestsMembersRef);
				if ($scope.user && $scope.user.groups && $scope.user.groups.priests) {
					myPriestsMembersObj.displayName = $scope.user.displayName;
					myPriestsMembersObj.$save();
				} else {
					myPriestsMembersObj.$remove();
				}
			}
			
			var myAdultsMembersRef = firebase.database().ref().child('groups').child('adults').child('members').child($rootScope.uid);
			if (myAdultsMembersRef) {
				var myAdultsMembersObj = $firebaseObject(myAdultsMembersRef);
				if ($scope.user && $scope.user.groups && $scope.user.groups.adults) {
					myAdultsMembersObj.displayName = $scope.user.displayName;
					myAdultsMembersObj.$save();
				} else {
					myAdultsMembersObj.$remove();
				}
			}
			
			var myLeadersMembersRef = firebase.database().ref().child('groups').child('leaders').child('members').child($rootScope.uid);
			if (myLeadersMembersRef) {
				var myLeadersMembersObj = $firebaseObject(myLeadersMembersRef);
				if ($scope.user && $scope.user.groups && $scope.user.groups.leaders) {
					myLeadersMembersObj.displayName = $scope.user.displayName;
					myLeadersMembersObj.$save();
				} else {
					myLeadersMembersObj.$remove();
				}
			}
			
			var myParentsMembersRef = firebase.database().ref().child('groups').child('parents').child('members').child($rootScope.uid);
			if (myParentsMembersRef) {
				var myParentsMembersObj = $firebaseObject(myParentsMembersRef);
				if ($scope.user && $scope.user.groups && $scope.user.groups.parents) {
					myParentsMembersObj.displayName = $scope.user.displayName;
					myParentsMembersObj.$save();
				} else {
					myParentsMembersObj.$remove();
				}
			}
			
			var myVisitorsMembersRef = firebase.database().ref().child('groups').child('visitors').child('members').child($rootScope.uid);
			if (myVisitorsMembersRef) {
				var myVisitorsMembersObj = $firebaseObject(myVisitorsMembersRef);
				if ($scope.user && $scope.user.groups && $scope.user.groups.visitors) {
					myVisitorsMembersObj.displayName = $scope.user.displayName;
					myVisitorsMembersObj.$save();
				} else {
					myVisitorsMembersObj.$remove();
				}
			}
		});
	});
	$scope.newSelfie = function() {
		//var storageRef = firebase.storage().ref();
		//var usersRef = storageRef.child('users');
		$ionicPopup.alert({
			title: 'Not Ready!',
			content: "Coming Soon!"
		});
	}
	$scope.resetMyPoints = function() {
		var confirmPopup = $ionicPopup.confirm({
			title: 'Delete My Points',
			template: 'Are you sure you want to delete ALL of your Points? This action CANNOT be undone!'
		});
		confirmPopup.then(function(res) {
			if(res) {
				Points.wipe();
			} else {
			}
		});
	}
	$scope.doRefresh = function() {
		//console.log($rootScope.authData);
		$scope.$broadcast('scroll.refreshComplete');
	}
})

.controller('usersCtrl', function($scope, $stateParams, Users, Groups) {
	var loadAll = function() {
		$scope.users = Users.all();
		$scope.deacons = Groups.members('deacons');
		$scope.teachers = Groups.members('teachers');
		$scope.priests = Groups.members('priests');
		$scope.parents = Groups.members('parents');
		$scope.adults = Groups.members('adults');
		$scope.leaders = Groups.members('leaders');
		$scope.visitors = Groups.members('visitors');
	}
	$scope.$on('$stateChangeSuccess', function() {
		loadAll();
	});
	$scope.doRefresh = function() {
		loadAll();
		$scope.$broadcast('scroll.refreshComplete');
	}
})

.controller('userDetailCtrl', function($scope, $stateParams, User, $firebaseObject, $ionicPopup, $ionicHistory) {
	$scope.deleteUser = function() {
		var confirmPopup = $ionicPopup.confirm({
			title: 'Delete User',
			template: 'Are you sure you want to delete this user?'
		});
		confirmPopup.then(function(res) {
			if(res) {
				firebase.database().ref().child('users').child($stateParams.userId).remove();
				firebase.database().ref().child('adults').child('members').child($stateParams.userId).remove();
				firebase.database().ref().child('deacons').child('members').child($stateParams.userId).remove();
				firebase.database().ref().child('leaders').child('members').child($stateParams.userId).remove();
				firebase.database().ref().child('parents').child('members').child($stateParams.userId).remove();
				firebase.database().ref().child('priests').child('members').child($stateParams.userId).remove();
				firebase.database().ref().child('teachers').child('members').child($stateParams.userId).remove();
				firebase.database().ref().child('visitors').child('members').child($stateParams.userId).remove();
				var logsRef = firebase.database().ref().child('logs');
				logsRef.orderByChild('uid').equalTo($stateParams.userId).on("child_added", function(snapshot) {
				  console.log(snapshot.key);
				});
				$ionicHistory.goBack()
			} else {
			}
		});
	};
	var user = User($stateParams.userId);
	user.$loaded().then(function(data) {
		data.$bindTo($scope, "user").then(function() {
			if (data.firstName && data.lastName) {
				$scope.user.displayName = data.firstName + " " + data.lastName;
			} else if (data.firstName) {
				$scope.user.displayName = data.firstName;
			} else if (data.lastName) {
				$scope.user.displayName = data.lastName;
			} else if (data.email) {
				$scope.user.displayName = data.email;
			} else {
				$scope.user.displayName = "";
			}
		});
		var unwatch = data.$watch(function() {
			if ($scope.user.firstName && $scope.user.lastName) {
				$scope.user.displayName = $scope.user.firstName + " " + $scope.user.lastName;
			} else if ($scope.user.firstName) {
				$scope.user.displayName = $scope.user.firstName;
			} else if ($scope.user.lastName) {
				$scope.user.displayName = $scope.user.lastName;
			} else if ($scope.user.email) {
				$scope.user.displayName = $scope.user.email;
			} else {
				$scope.user.displayName = "";
			}
			
			var userDeaconsMembersRef = firebase.database().ref().child('groups').child('deacons').child('members').child($stateParams.userId);
			if (userDeaconsMembersRef) {
				var userDeaconsMembersObj = $firebaseObject(userDeaconsMembersRef);
				if ($scope.user && $scope.user.groups && $scope.user.groups.deacons) {
					userDeaconsMembersObj.displayName = $scope.user.displayName;
					userDeaconsMembersObj.$save();
				} else {
					userDeaconsMembersObj.$remove();
				}
			}
			
			var userTeachersMembersRef = firebase.database().ref().child('groups').child('teachers').child('members').child($stateParams.userId);
			if (userTeachersMembersRef) {
				var userTeachersMembersObj = $firebaseObject(userTeachersMembersRef);
				if ($scope.user && $scope.user.groups && $scope.user.groups.teachers) {
					userTeachersMembersObj.displayName = $scope.user.displayName;
					userTeachersMembersObj.$save();
				} else {
					userTeachersMembersObj.$remove();
				}
			}
			
			var userPriestsMembersRef = firebase.database().ref().child('groups').child('priests').child('members').child($stateParams.userId);
			if (userPriestsMembersRef) {
				var userPriestsMembersObj = $firebaseObject(userPriestsMembersRef);
				if ($scope.user && $scope.user.groups && $scope.user.groups.priests) {
					userPriestsMembersObj.displayName = $scope.user.displayName;
					userPriestsMembersObj.$save();
				} else {
					userPriestsMembersObj.$remove();
				}
			}
			
			var userAdultsMembersRef = firebase.database().ref().child('groups').child('adults').child('members').child($stateParams.userId);
			if (userAdultsMembersRef) {
				var userAdultsMembersObj = $firebaseObject(userAdultsMembersRef);
				if ($scope.user && $scope.user.groups && $scope.user.groups.adults) {
					userAdultsMembersObj.displayName = $scope.user.displayName;
					userAdultsMembersObj.$save();
				} else {
					userAdultsMembersObj.$remove();
				}
			}
			
			var userLeadersMembersRef = firebase.database().ref().child('groups').child('leaders').child('members').child($stateParams.userId);
			if (userLeadersMembersRef) {
				var userLeadersMembersObj = $firebaseObject(userLeadersMembersRef);
				if ($scope.user && $scope.user.groups && $scope.user.groups.leaders) {
					userLeadersMembersObj.displayName = $scope.user.displayName;
					userLeadersMembersObj.$save();
				} else {
					userLeadersMembersObj.$remove();
				}
			}
			
			var userParentsMembersRef = firebase.database().ref().child('groups').child('parents').child('members').child($stateParams.userId);
			if (userParentsMembersRef) {
				var userParentsMembersObj = $firebaseObject(userParentsMembersRef);
				if ($scope.user && $scope.user.groups && $scope.user.groups.parents) {
					userParentsMembersObj.displayName = $scope.user.displayName;
					userParentsMembersObj.$save();
				} else {
					userParentsMembersObj.$remove();
				}
			}
			
			var userVisitorsMembersRef = firebase.database().ref().child('groups').child('visitors').child('members').child($stateParams.userId);
			if (userVisitorsMembersRef) {
				var userVisitorsMembersObj = $firebaseObject(userVisitorsMembersRef);
				if ($scope.user && $scope.user.groups && $scope.user.groups.visitors) {
					userVisitorsMembersObj.displayName = $scope.user.displayName;
					userVisitorsMembersObj.$save();
				} else {
					userVisitorsMembersObj.$remove();
				}
			}
		});
	});
	$scope.doRefresh = function() {
		$scope.user = User($stateParams.userId);
		//console.log($stateParams.userId);
		$scope.$broadcast('scroll.refreshComplete');
	}
})

.controller('feedCtrl', function($scope, Feed, $ionicHistory) {
	$scope.date = new Date();
	$scope.predicate = 'dateTime';
	$scope.reverse = true;
	$scope.feedlist = Feed.all();
	$scope.doRefresh = function() {
		$scope.feedlist = Feed.all();
		$scope.$broadcast('scroll.refreshComplete');
	}
	$scope.showingFuture = false;
	$scope.showFutureBtn = "Show Future";
	$scope.showFuture = function() {
		if ($scope.showingFuture) {
			$scope.showingFuture = false;
			$scope.showFutureBtn = "Show Future";
		} else {
			$scope.showingFuture = true;
			$scope.showFutureBtn = "Hide Future";
		}
	};
	$scope.showingCompleted = false;
	$scope.showCompletedBtn = "Show Completed";
	$scope.showCompleted = function() {
		if ($scope.showingCompleted) {
			$scope.showingCompleted = false;
			$scope.showCompletedBtn = "Show Completed";
		} else {
			$scope.showingCompleted = true;
			$scope.showCompletedBtn = "Hide Completed";
		}
	};
	$scope.order = function(predicate) {
		$scope.predicate = predicate;
		$scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
	};
	$scope.filterFeed = function(){
		return function(feeditem){
			if ($scope.showingFuture) {
				return true;
			} else {
				var dateObj = new Date(feeditem.dateTime);
				return dateObj < new Date();
			}
		}
	}
})

.controller('goalsCtrl', function($scope, $ionicModal, Points, $ionicPopup, $state, $ionicLoading) {
	$ionicModal.fromTemplateUrl('templates/report-points.html?v=9dn27', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal){
		$scope.modal = modal;
	});
	$scope.pointslist = Points.all();
	$scope.pointsTotal = Points.calcPoints();
	$scope.today = [];
	$scope.today.scripture = false;
	$scope.pointValue = 5;
	var resetReportModal = function() {
		$scope.date = null;
		$scope.pointInfo = [];
		$scope.dateButtons = true;
		$scope.dateField = false;
		$scope.reportingType = null;
	}
	resetReportModal();
	$scope.$on('modal.hidden', function() {
		resetReportModal();
	});
	$scope.setReportDateToday = function() {
		$scope.pointInfo.date = new Date();
		$scope.dateButtons = false;
		$scope.dateField = true;
	}
	$scope.reportScriptures = function() {
		$scope.reportingType = 'scriptures';
		$scope.pointInfo.date = new Date();
		$scope.pointValue = 100;
		$scope.modal.show();
	}
	$scope.reportJournal = function() {
		$scope.reportingType = 'journal';
		$scope.pointInfo.date = new Date();
		$scope.pointValue = 50;
		$scope.modal.show();
	}
	$scope.reportDutyToGod = function() {
		$scope.reportingType = 'dutytogod';
		$scope.pointInfo.date = new Date();
		$scope.pointValue = 100;
		$scope.modal.show();
	}
	$scope.reportTemple = function() {
		$scope.reportingType = 'temple';
		$scope.pointInfo.date = new Date();
		$scope.pointValue = 500;
		$scope.modal.show();
	}
	$scope.reportScouting = function() {
		$scope.reportingType = 'scouting';
		$scope.pointInfo.date = new Date();
		$scope.pointValue = 1250;
		$scope.modal.show();
	}
	$scope.reportLesson = function() {
		var confirmPopup = $ionicPopup.confirm({
			title: 'Report from each Lesson',
			template: 'To report your Lesson, you must scroll to the bottom of the lesson and click it there. Would you like me to take you to the lessons page?'
		});
		confirmPopup.then(function(res) {
			if(res) {
				$state.go('tabsController.lessons');
			} else {
			}
		});
	}
	$scope.doReport = function() {
		var dateStart = new Date("2016-06-01T00:00:00-07:00");
		var dateEnd = new Date("2016-07-31T23:59:59-07:00");
		var today = new Date();
		var tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		var date = new Date($scope.pointInfo.date);
		if ($scope.reportingType == 'scriptures') {
			if (today.toDateString() == date.toDateString()) {
				$scope.today.scripture = true;
			}
		}
		if ($scope.reportingType == 'journal') {
			if (today.toDateString() == date.toDateString()) {
				$scope.today.journal = true;
			}
		}
		if (date > dateStart && date < tomorrow) {
			var pointInfo = {
				pointValue: $scope.pointValue,
				type: $scope.reportingType,
				date: date,
				title: $scope.reportingType + " points on " + date.toISOString().split('T')[0]
			};
			Points.add(pointInfo);
			$ionicPopup.alert({
				title: 'Success Reporting',
				template: "You just earned " + $scope.pointValue + " points!"
			}).then(function(res) {
				$scope.modal.hide();
				$ionicLoading.hide();
			});
		} else {
			$ionicPopup.alert({
				title: 'Invalid Date!',
				content: date.toDateString() + " is invalid"
			});
		}
	}
	$scope.doRefresh = function() {
		$scope.pointslist = Points.all();
		$scope.pointsTotal = Points.calcPoints();
		$scope.$broadcast('scroll.refreshComplete');
	}
})

.controller('lessonsCtrl', function($scope, Lessons) {
	$scope.date = new Date();
	$scope.predicate = 'day';
	$scope.reverse = true;
	$scope.lessons = Lessons.all();
	$scope.showingFuture = false;
	$scope.showFutureBtn = "Show Future";
	$scope.showFuture = function() {
		if ($scope.showingFuture) {
			$scope.showingFuture = false;
			$scope.showFutureBtn = "Show Future";
		} else {
			$scope.showingFuture = true;
			$scope.showFutureBtn = "Hide Future";
		}
	};
	$scope.showingCompleted = false;
	$scope.showCompletedBtn = "Show Completed";
	$scope.showCompleted = function() {
		if ($scope.showingCompleted) {
			$scope.showingCompleted = false;
			$scope.showCompletedBtn = "Show Completed";
		} else {
			$scope.showingCompleted = true;
			$scope.showCompletedBtn = "Hide Completed";
		}
	};
	$scope.doRefresh = function() {
		$scope.lessons = Lessons.all();
		$scope.$broadcast('scroll.refreshComplete');
	}
	$scope.order = function(predicate) {
		$scope.predicate = predicate;
		$scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
		//$scope.lessons = orderBy($scope.lessons, predicate, $scope.reverse);
	};
	$scope.filterPosts = function(){
		return function(lesson){
			if ($scope.showingFuture) {
				return true;
			} else {
				var dateStartObj = new Date(lesson.dateStart);
				return dateStartObj < new Date();
			}
		}
	}
})

.controller('lessonsDetailCtrl', function($scope, $stateParams, Lessons, $ionicPopup, $ionicModal, $ionicLoading, Points) {
	$ionicModal.fromTemplateUrl('templates/report-points.html?v=9dn27', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal){
		$scope.modal = modal;
	});
	var lesson = Lessons.get($stateParams.lessonId);
	//$scope.dateStartObj = new Date($scope.lesson);
	$scope.pointTotal = 0;
	lesson.$loaded().then(function(data) {
		$scope.lesson = lesson;
		$scope.lessonId = $stateParams.lessonId;
		getActions();
	});
	var getActions = function() {
		var pointTotal = 0;
		var actions = Lessons.getActions($stateParams.lessonId);
		if (actions) {
			//console.log(actions);
			angular.forEach(actions, function(rec) {
			//});
			//angular.forEach(actions, function(value, key) {
				console.log(rec);
				pointTotal += rec.pointValue ? rec.pointValue : 0;
				if (1) {
					pointTotal += 1;
					//$scope.actions[key].isCompleted = true;
				}
			});
			$scope.actions = actions;
			$scope.pointTotal = pointTotal;
		} else {
			$scope.actions = null;
		}
	}
	var resetReportModal = function() {
		$scope.date = null;
		$scope.pointInfo = [];
		$scope.dateButtons = true;
		$scope.dateField = false;
		$scope.reportingType = null;
	}
	resetReportModal();
	$scope.$on('modal.hidden', function() {
		resetReportModal();
	});
	$scope.reportAction = function(actionId) {
		var action = Lessons.getAction($stateParams.lessonId, actionId);
		action.$loaded().then(function(data) {
			$scope.reportingType = 'lesson';
			if (actionId == 'journal') {
				$scope.reportingType = 'journal';
			}
			$scope.pointInfo.date = new Date();
			$scope.pointValue = data.pointValue ? data.pointValue : 0;
			$scope.modal.show();
		});
	}
	$scope.setReportDateToday = function() {
		$scope.pointInfo.date = new Date();
		$scope.dateButtons = false;
		$scope.dateField = true;
	}
	$scope.doReport = function() {
		var dateStart = new Date("2016-06-01T00:00:00-07:00");
		var dateEnd = new Date("2016-07-31T23:59:59-07:00");
		var today = new Date();
		var tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		var date = new Date($scope.pointInfo.date);
		if (date > dateStart && date < tomorrow) {
			var pointInfo = {
				key: $scope.lessonId,
				pointValue: $scope.pointValue,
				type: $scope.reportingType,
				date: date,
				title: " Completed " + $scope.lesson.date + " lesson on " + date.toISOString().split('T')[0]
			};
			Points.add(pointInfo);
			$ionicPopup.alert({
				title: 'Success Reporting',
				template: "You just earned " + $scope.pointValue + " points!"
			}).then(function(res) {
				$scope.modal.hide();
				$ionicLoading.hide();
			});
		} else {
			$ionicPopup.alert({
				title: 'Invalid Date!',
				content: date.toDateString() + " is invalid"
			});
		}
	}
	$scope.doRefresh = function() {
		$scope.lesson = Lessons.get($stateParams.lessonId);
		getActions();
		$scope.$broadcast('scroll.refreshComplete');
	}
})

.controller('rewardsCtrl', function($scope, Rewards) {
	$scope.predicate = 'dateClaim';
	$scope.reverse = false;
	$scope.showingFuture = true;
	$scope.rewards = Rewards.all();
	$scope.doRefresh = function() {
		$scope.rewards = Rewards.all();
		$scope.$broadcast('scroll.refreshComplete');
	}
	$scope.order = function(predicate) {
		$scope.predicate = predicate;
		$scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
	};
	$scope.filterRewards = function(){
		return function(reward){
			if ($scope.showingFuture) {
				return true;
			} else {
				var dateObj = new Date(reward.dateClaim);
				return dateObj < new Date();
			}
		}
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

.controller('memorizeDetailCtrl', function($scope, $stateParams, Memorize, Groups, $ionicPopup) {
	$scope.date = new Date();
	$scope.memorize = Memorize.get($stateParams.memorizeId);
	$scope.disabledcheckbox = false;
	$scope.checkboxchecked = false;
	var leaders = Groups.members('leaders');
	var leadersList = [];
	leaders.$loaded().then(function() {
		angular.forEach(leaders, function(rec) {
			if (rec.displayName) {
				leadersList.push(rec.displayName);
			}
		});
	});
	$scope.change = function() {
		//$scope.checkbox = false;
		//$scope.disabledcheckbox = true;
		$ionicPopup.alert({
			title: 'Check with one of your leaders',
			template: "You cannot award yourself these points, only one of your leaders can.<br><br>" + leadersList.join("<br>")
		});
	}
	$scope.doRefresh = function() {
		$scope.memorize = Memorize.get($stateParams.memorizeId);
		$scope.$broadcast('scroll.refreshComplete');
	}
})
