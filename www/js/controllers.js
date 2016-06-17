angular.module('app.controllers', [])

.controller('LoginCtrl', function($scope, $state, $ionicHistory, $ionicPopup, $location, $ionicModal, $ionicLoading, $rootScope, $firebaseAuth, User, $firebaseObject, $localStorage) {
	if ($rootScope.uid) {
		$state.go('tabsController.feed');
	}
	$ionicModal.fromTemplateUrl('templates/signup.html?v=7d2md', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal){
		$scope.modal = modal;
	});
	$scope.showsociallogin = false;
	$scope.registerUser = {};
	$scope.user = {
		email: null
	};
	if ($localStorage && $localStorage.lastEmail) {
		$scope.user.email = $localStorage.lastEmail;
	}

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
				$localStorage.lastEmail = loginUser.email;
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

.controller('accountCtrl', function($scope, $rootScope, $state, $ionicHistory, $ionicPopup) {
	$scope.doSignOut = function(){
		$rootScope.authData = null;
		$rootScope.currentUser = null;
		$rootScope.uid = null;
		$ionicHistory.clearHistory();
		$ionicHistory.clearCache();
		$rootScope.authObj.$signOut();
		$state.go('login');
	}
	if (!$rootScope.uid) {
		$ionicHistory.clearHistory();
		$ionicHistory.clearCache();
		$state.go('login');
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
		$scope.$broadcast('scroll.refreshComplete');
	}
})

.controller('userEditCtrl', function($scope, $rootScope, $stateParams, $ionicLoading, $ionicPlatform, $ionicModal, User, Groups, $ionicPopup, $ionicHistory, filepickerService, $cordovaCamera) {
	$scope.isMe = true;
	if ($stateParams.userId) {
		$scope.isMe = false;
		var user = User($stateParams.userId);
		$scope.userUid = $stateParams.userId;
		user.$bindTo($scope, "user").then(function() {
		});
	} else if ($rootScope.uid && $rootScope.currentUser) {
		$scope.userUid = $rootScope.uid;
		var user = User($rootScope.uid);
		user.$bindTo($scope, "user").then(function() {
		});
		//$scope.user = $rootScope.currentUser;
		//$scope.user.uid = $rootScope.uid;
	} else {
		$scope.user = null;
	}
	$scope.newProfilePhoto = function() {
		$ionicPlatform.ready(function() {
			if (window.Camera) {
				var options = {
					quality: 90,
					destinationType: Camera.DestinationType.DATA_URL,
					sourceType: Camera.PictureSourceType.CAMERA,
					allowEdit: true,
					encodingType: Camera.EncodingType.JPEG,
					targetWidth: 1024,
					targetHeight: 1024,
					popoverOptions: CameraPopoverOptions,
					saveToPhotoAlbum: false,
					correctOrientation:true,
					cameraDirection: Camera.Direction.FRONT
				};
				$cordovaCamera.getPicture(options).then(function(imageData) {
					$ionicLoading.show({template: 'Uploading...'});
					filepickerService.store(imageData, {base64decode: true}, filepickerSuccess, filepickerError, filepickerProgress);
					//var image = document.getElementById('myAvatar');
					//image.src = "data:image/jpeg;base64," + imageData;
				}, function(err) {
					// error
				});
			} else {
				filepickerService.pick({mimetype: 'image/*'}, filepickerSuccess, filepickerError, filepickerProgress);
				//$ionicPopup.alert({
				//	title: 'Filepicker',
				//	content: "Would Activate File Picker"
				//});
			}
		});
	}
	var filepickerSuccess = function(Blob){
		console.log(JSON.stringify(Blob));
		if (Blob.url) {
			//var image = document.getElementById('myAvatar');
			//image.src = Blob.url;

			var userAvatarRef = firebase.database().ref().child('users').child($scope.userUid).child('avatarUrl');
			userAvatarRef.set(Blob.url);

			//$scope.userUid
			//$scope.user.avatarUrl = Blob.url;
			$ionicLoading.hide();
			//$scope.user.$save;
		}
	};
	var filepickerError = function(FPError){
		console.log(JSON.stringify(FPError));
		$ionicLoading.hide();
	};
	var filepickerProgress = function(FPProgress){
		$ionicLoading.show({template: FPProgress + '% Uploading...'});
		console.log(JSON.stringify(FPProgress));
	};

	$scope.groupsList = [];
	var groupsRef = firebase.database().ref().child('groups');
	groupsRef.once("value", function(snapshot) {
		$scope.groups = snapshot.val();
		snapshot.forEach(function(childSnapshot) {
			var childData = childSnapshot.val();
			$scope.groupsList.push(childData.displayName);
		});
	});
	//var groups = Groups.all();
	//groups.$loaded().then(function(data) {
		//$scope.groups = data;
		//makeGroupList();
	//});
	var makeGroupList = function() {
		$scope.groupsList = [];
		angular.forEach($scope.groups, function(rec) {
			if ($scope.user && $scope.user.groups && $scope.user.groups[rec.$id]) {
				$scope.groupsList.push(rec.displayName);
			}
		});
	}
	$ionicModal.fromTemplateUrl('templates/user-groups.html?v=7d2md', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal){
		$scope.modal = modal;
	});
	$scope.editGroups = function() {
		$scope.modal.show();
	}
	$scope.saveUser = function() {
		$scope.user.$save().then(function(ref) {
			$ionicPopup.alert({
				title: 'Saved Groups',
				content: "Success"
			}).then(function(res) {
				$ionicLoading.hide();
			});
		});
	}
	$scope.saveGroups = function() {
		//$scope.user.$save().then(function(ref) {
			angular.forEach(groups, function(rec) {
				if (rec.$id) {
					var groupKey = rec.$id;
					var userGroupMemberRef = firebase.database().ref().child('groups').child(groupKey).child('members');
					if ($scope.user.groups[rec.$id] === true) {
						userGroupMemberRef.child($stateParams.userId).set({displayName: $scope.user.displayName});
					} else {
						userGroupMemberRef.child($stateParams.userId).remove();
					}
				}
			});
			$ionicPopup.alert({
				title: 'Saved Groups',
				content: "Success"
			}).then(function(res) {
				makeGroupList();
				$scope.modal.hide();
				$ionicLoading.hide();
			});
		//}, function(error) {
		//	$ionicPopup.alert({
		//		title: 'Saved Groups',
		//		content: error
		//	});
		//});
	}
	$scope.doRefresh = function() {
		//$scope.user = User($stateParams.userId);
		//console.log($stateParams.userId);
		$scope.$broadcast('scroll.refreshComplete');
	}
})

.controller('userPointsCtrl', function($scope, $rootScope, $stateParams, User, Points, $ionicPopup, $ionicHistory) {
	$scope.isMe = true;
	if ($stateParams.userId) {
		$scope.isMe = false;
		var user = User($stateParams.userId);
		user.$loaded().then(function(data) {
			data.uid = $stateParams.userId;
			$scope.user = data;
		});
		var pointsList = Points.all();
		pointsList.$loaded().then(function(data) {
			$scope.pointsList = data;
		});
	} else if ($rootScope.uid && $rootScope.currentUser) {
		$scope.user = $rootScope.currentUser;
		$scope.user.uid = $rootScope.uid;
		var pointsList = Points.all();
		pointsList.$loaded().then(function(data) {
			$scope.pointsList = data;
		});
	} else {
		$scope.user = null;
	}
	$scope.doRefresh = function() {
		//console.log($stateParams.userId);
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

.controller('userDetailCtrl', function($scope, $rootScope, $stateParams, User, $firebaseObject, $ionicPopup, $ionicHistory) {
	var user = User($stateParams.userId);
	user.$loaded().then(function(data) {
		$scope.user = data;
	});
	$scope.deleteUser = function() {
		if ($rootScope.uid != "sRGIklkF2zQ7xYZqh7p1gczZe0J3") {
			// only Rich can do this
			$ionicPopup.alert({
				title: 'Delete User',
				template: "You don't have permission to delete"
			});
		} else {
			$ionicPopup.confirm({
				title: 'Delete User',
				template: 'Are you sure you want to delete this user?'
			}).then(function(res) {
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
					// cancelled
				}
			});
		}
	};
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
	$ionicModal.fromTemplateUrl('templates/report-points.html?v=7d2md', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal){
		$scope.modal = modal;
	});
	var date = new Date();
	$scope.dateKey = makeDateKey();
	$scope.dayKey = makeDayKey();
	$scope.weekKey = makeWeekKey();
	$scope.scriptureKey = 'scriptures' + $scope.dateKey;
	$scope.journalKey = 'journal' + $scope.dateKey;
	$scope.lessonKey = 'lesson' + $scope.dayKey;
	$scope.dutyToGodKey = 'dutyToGod' + $scope.weekKey;
	$scope.templeKey = 'temple' + $scope.weekKey;
	$scope.testimonyKey = 'testimony' + $scope.weekKey;
	$scope.scoutingKey = 'scouting' + $scope.weekKey;
	$scope.pointsList = Points.all();
	$scope.pointsTotal = Points.calcPoints();
	$scope.today = [];
	$scope.today.scripture = false;
	$scope.pointValue = 5;
	var resetReportModal = function() {
		$scope.date = null;
		$scope.pointInfo = [];
		$scope.dateButtons = true;
		$scope.dateField = false;
		$scope.saveBtn = false;
		$scope.reportingType = null;
	}
	resetReportModal();
	$scope.$on('modal.hidden', function() {
		resetReportModal();
	});
	$scope.setReportDateToday = function() {
		$scope.pointInfo.date = new Date();
		$scope.pointInfo.date.setHours(0);
		$scope.dateButtons = false;
		$scope.dateField = false;
		$scope.saveBtn = true;
	}
	$scope.setReportDateOther = function() {
		$scope.pointInfo.date = new Date();
		$scope.pointInfo.date.setHours(0);
		$scope.dateButtons = false;
		$scope.dateField = true;
		$scope.saveBtn = true;
	}
	$scope.reportScriptures = function() {
		$scope.reportingType = 'scriptures';
		$scope.pointInfo.date = new Date();
		$scope.pointInfo.date.setHours(0);
		$scope.pointValue = 100;
		$scope.modal.show();
	}
	$scope.reportJournal = function() {
		$scope.reportingType = 'journal';
		$scope.pointInfo.date = new Date();
		$scope.pointInfo.date.setHours(0);
		$scope.pointValue = 50;
		$scope.modal.show();
	}
	$scope.reportDutyToGod = function() {
		$scope.reportingType = 'dutyToGod';
		$scope.pointInfo.date = new Date();
		$scope.pointInfo.date.setHours(0);
		$scope.pointValue = 250;
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
		$scope.pointInfo.date.setHours(0);
		$scope.pointValue = 75;
		$scope.modal.show();
	}
	$scope.reportTestimony = function() {
		$scope.reportingType = 'testimony';
		$scope.pointInfo.date = new Date();
		$scope.pointInfo.date.setHours(0);
		$scope.pointValue = 100;
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
		today.setHours(0);
		var tomorrow = new Date();
		tomorrow.setHours(0);
		tomorrow.setDate(tomorrow.getDate() + 1);
		var date = new Date($scope.pointInfo.date);
		date.setHours(0);
		if (date < dateStart) {
			$ionicPopup.alert({
				title: 'Date is too old!',
				content: date.toDateString() + " is invalid"
			});
		} else if (date > today) {
			$ionicPopup.alert({
				title: 'Future Date!',
				content: date.toDateString() + " is invalid"
			});
		} else if (date > dateStart && date < tomorrow) {
			if ($scope.reportingType == 'dutyToGod' || $scope.reportingType == 'scouting' || $scope.reportingType == 'temple' || $scope.reportingType == 'testimony') {
				key = $scope.reportingType + makeWeekKey(date);
			}
			if ($scope.reportingType == 'scriptures' || $scope.reportingType == 'journal') {
				key = $scope.reportingType + makeDateKey(date);
			}
			if (!key) {
				key = null;
			}
			var pointInfo = {
				key: key,
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
		$scope.pointsList = Points.all();
		$scope.pointsTotal = Points.calcPoints();
		$scope.$broadcast('scroll.refreshComplete');
	}
})

.controller('lessonsCtrl', function($scope, $rootScope, $stateParams, Lessons, User) {
	$scope.listStyleCards = true;
	$scope.listStyleCardsBtn = "Cards";
	$scope.isMyLessons = true;
	if ($stateParams.userId) {
		$scope.isMyLessons = false;
		$scope.listStyleCards = false;
		$scope.listStyleCardsBtn = "List";
		var userRef = firebase.database().ref().child('users').child($stateParams.userId);
		userRef.on("value", function(snapshot) {
			$scope.user = snapshot.val();
			$scope.user.uid = $stateParams.userId;
		});
	} else if ($rootScope.uid && $rootScope.currentUser) {
		var userRef = firebase.database().ref().child('users').child($rootScope.uid);
		userRef.on("value", function(snapshot) {
			$scope.user = snapshot.val();
			$scope.user.uid = $rootScope.uid;
		});
	} else {
		$scope.user = null;
	}
	$scope.date = new Date();
	$scope.predicate = 'day';
	$scope.reverse = true;
	$scope.lessons = Lessons.all();
	$scope.showingFuture = false;
	$scope.showFutureBtn = "Hiding Future";
	$scope.showFuture = function() {
		if ($scope.showingFuture) {
			$scope.showingFuture = false;
			$scope.showFutureBtn = "Hiding Future";
		} else {
			$scope.showingFuture = true;
			$scope.showFutureBtn = "Showing Future";
		}
	};
	$scope.toggleListStyleCard = function() {
		if ($scope.listStyleCards) {
			$scope.listStyleCards = false;
			$scope.listStyleCardsBtn = "List";
		} else {
			$scope.listStyleCards = true;
			$scope.listStyleCardsBtn = "Cards";
		}
	};
	$scope.showingCompleted = true;
	$scope.showCompletedBtn = "Showing Completed";
	$scope.showCompleted = function() {
		if ($scope.showingCompleted) {
			$scope.showingCompleted = false;
			$scope.showCompletedBtn = "Hiding Completed";
		} else {
			$scope.showingCompleted = true;
			$scope.showCompletedBtn = "Showing Completed";
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
			//var show = true;
			if (!$scope.showingFuture) {
				var dateStartObj = new Date(lesson.dateStart);
				var date = new Date();
				if (dateStartObj.getTime() > date.getTime()) {
					return false;
				}
			}
			if (!$scope.showingCompleted) {
				if ($scope.user && $scope.user.points && $scope.user.points[lesson.$id] && $scope.user.points[lesson.$id].pointValue) {
					return false;
				}
			}
			return true;
		}
	}
})

.controller('lessonsDetailCtrl', function($scope, $rootScope, $stateParams, Lessons, $ionicPopup, $ionicModal, $ionicLoading, User, Points) {
	$scope.isMyLessons = true;
	if ($stateParams.userId) {
		$scope.isMyLessons = false;
		var userRef = firebase.database().ref().child('users').child($stateParams.userId);
		userRef.on("value", function(snapshot) {
			$scope.user = snapshot.val();
			$scope.user.uid = $stateParams.userId;
		});
	} else if ($rootScope.uid && $rootScope.currentUser) {
		var userRef = firebase.database().ref().child('users').child($rootScope.uid);
		userRef.on("value", function(snapshot) {
			$scope.user = snapshot.val();
			$scope.user.uid = $rootScope.uid;
		});
	} else {
		$scope.user = null;
	}
	$ionicModal.fromTemplateUrl('templates/report-points.html?v=7d2md', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal){
		$scope.modal = modal;
	});
	var lesson = Lessons.get($stateParams.lessonId);
	//$scope.dateStartObj = new Date($scope.lesson);
	$scope.pointTotal = 0;
	lesson.$loaded().then(function(data) {
		$scope.lesson = data;
		$scope.lessonId = $stateParams.lessonId;
		getActions();
	});
	var getActions = function() {
		var pointTotal = 0;
		var actions = Lessons.getActions($stateParams.lessonId);
		actions.$loaded().then(function(data) {
			if (data) {
				//console.log(actions);
				angular.forEach(data, function(rec, key) {
					if (rec.$id == 'lesson') {
						data[key].actionKey = $scope.lessonId;
					} else if (rec.$id == 'journal') {
						data[key].actionKey = 'journal';
					} else if (rec.$id == 'dutyToGod') {
						data[key].actionKey = 'dutyToGod' + makeWeekKey();
					} else if (rec.$id == 'challenge') {
						data[key].actionKey = $scope.lessonId + 'challenge';
					} else if (rec.$id == 'bonus') {
						data[key].actionKey = $scope.lessonId + 'bonus';
					} else {
						data[key].actionKey = rec.$id;
					}
				//});
				//angular.forEach(actions, function(value, key) {
					console.log(rec);
					pointTotal += rec.pointValue ? rec.pointValue : 0;
					//if (1) {
					//	pointTotal += 1;
						//$scope.actions[key].isCompleted = true;
					//}
				});
				$scope.actions = data;
				$scope.pointTotal = pointTotal;
			} else {
				$scope.actions = null;
			}
		});
	}
	var resetReportModal = function() {
		$scope.date = null;
		$scope.pointInfo = [];
		$scope.dateButtons = true;
		$scope.dateField = false;
		$scope.saveBtn = false;
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
			if (actionId == 'lesson') {
				$scope.reportingType = 'lesson';
				$scope.actionKey = $stateParams.lessonId;
			}
			if (actionId == 'journal') {
				$scope.reportingType = 'journal';
				$scope.actionKey = null;
			}
			if (actionId == 'dutyToGod') {
				$scope.reportingType = 'dutyToGod';
				$scope.actionKey = null;
			}
			if (actionId == 'challenge') {
				$scope.reportingType = 'challenge';
				$scope.actionKey = $stateParams.lessonId + 'challenge';
			}
			if (actionId == 'bonus') {
				$scope.reportingType = 'bonus';
				$scope.actionKey = $stateParams.lessonId + 'bonus';
			}
			$scope.pointInfo.date = new Date();
			$scope.pointInfo.date.setHours(0);
			$scope.pointValue = data.pointValue ? data.pointValue : 0;
			$scope.modal.show();
		});
	}
	$scope.setReportDateToday = function() {
		$scope.pointInfo.date = new Date();
		$scope.pointInfo.date.setHours(0);
		$scope.dateButtons = false;
		$scope.dateField = false;
		$scope.saveBtn = true;
	}
	$scope.setReportDateOther = function() {
		$scope.pointInfo.date = new Date();
		$scope.pointInfo.date.setHours(0);
		$scope.dateButtons = false;
		$scope.dateField = true;
		$scope.saveBtn = true;
	}
	$scope.doReport = function() {
		var dateStart = new Date("2016-06-01T00:00:00-07:00");
		var dateEnd = new Date("2016-07-31T23:59:59-07:00");
		var today = new Date();
		today.setHours(0);
		var tomorrow = new Date();
		tomorrow.setHours(0);
		tomorrow.setDate(tomorrow.getDate() + 1);
		var date = new Date($scope.pointInfo.date);
		date.setHours(0);
		if ($scope.reportingType == 'lesson' && $scope.lesson.dateStart) {
			var dateStart = new Date($scope.lesson.dateStart);
		}
		if (date < dateStart) {
			$ionicPopup.alert({
				title: 'Date is too old!',
				content: date.toDateString() + " is invalid"
			});
		} else if (date > today) {
			$ionicPopup.alert({
				title: 'Future Date!',
				content: date.toDateString() + " is invalid"
			});
		} else if (date > dateStart && date < tomorrow) {
			var key = null;
			if ($scope.actionKey) {
				key = $scope.actionKey;
			} else if ($scope.reportingType == 'dutyToGod' || $scope.reportingType == 'scouting' || $scope.reportingType == 'temple' || $scope.reportingType == 'testimony') {
				key = $scope.reportingType + makeWeekKey(date);
			} else if ($scope.reportingType == 'scriptures' || $scope.reportingType == 'journal') {
				key = $scope.reportingType + makeDateKey(date);
			}
			if (!key) {
				key = null;
			}
			var pointInfo = {
				key: key,
				pointValue: $scope.pointValue,
				type: $scope.reportingType,
				date: date,
				title: " Completed " + $scope.lesson.date + " lesson on " + date.toISOString().split('T')[0]
			};
			Points.add(pointInfo, $scope.user.uid);
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

.controller('missionariesDetailLettersCtrl', function($scope, $stateParams, Missionaries) {
	$scope.missionary = Missionaries.get($stateParams.missionaryId);

	var missionaryLettersRef = firebase.database().ref().child('missionaries').child($stateParams.missionaryId).child('letters');
	missionaryLettersRef.on("value", function(snapshot) {
		$scope.letters = snapshot.val();
	});

	$scope.doRefresh = function() {
		$scope.$broadcast('scroll.refreshComplete');
	}
})

.controller('missionariesDetailLettersDetailCtrl', function($scope, $stateParams, Missionaries) {
	$scope.missionary = Missionaries.get($stateParams.missionaryId);

	var missionaryLetterRef = firebase.database().ref().child('missionaries').child($stateParams.missionaryId).child('letters').child($stateParams.letterId);
	missionaryLetterRef.on("value", function(snapshot) {
		$scope.letter = snapshot.val();
	});

	$scope.doRefresh = function() {
		$scope.$broadcast('scroll.refreshComplete');
	}
})

.controller('memorizeCtrl', function($scope, $rootScope, $stateParams, User, Memorize) {
	$scope.date = new Date();
	$scope.memorizelist = Memorize.all();
	$scope.isMyGoals = true;
	if ($stateParams.userId) {
		$scope.isMyGoals = false;
		var userRef = firebase.database().ref().child('users').child($stateParams.userId);
		userRef.on("value", function(snapshot) {
			$scope.user = snapshot.val();
			$scope.user.uid = $stateParams.userId;
		});
	} else if ($rootScope.uid && $rootScope.currentUser) {
		var userRef = firebase.database().ref().child('users').child($rootScope.uid);
		userRef.on("value", function(snapshot) {
			$scope.user = snapshot.val();
			$scope.user.uid = $rootScope.uid;
		});
	} else {
		$scope.user = null;
	}
	$scope.doRefresh = function() {
		$scope.memorizelist = Memorize.all();
		$scope.$broadcast('scroll.refreshComplete');
	}
})

.controller('memorizeDetailCtrl', function($scope, $rootScope, $stateParams, User, Memorize, Groups, Points, $ionicPopup) {
	$scope.isMyGoals = true;
	if ($stateParams.userId) {
		$scope.isMyGoals = false;
		var userRef = firebase.database().ref().child('users').child($stateParams.userId);
		userRef.on("value", function(snapshot) {
			$scope.user = snapshot.val();
			$scope.user.uid = $stateParams.userId;
		});
	} else if ($rootScope.uid && $rootScope.currentUser) {
		var userRef = firebase.database().ref().child('users').child($rootScope.uid);
		userRef.on("value", function(snapshot) {
			$scope.user = snapshot.val();
			$scope.user.uid = $rootScope.uid;
		});
	} else {
		$scope.user = null;
	}
	var memorizeRef = firebase.database().ref().child('memorize').child($stateParams.memorizeId);
	memorizeRef.once("value", function(snapshot) {
		$scope.memorize = snapshot.val();
		$scope.memorize.key = $stateParams.memorizeId;
	});
	var leadersList = [];
	var leadersRef = firebase.database().ref().child('groups').child('leaders').child('members');
	leadersRef.once("value", function(snapshot) {
		snapshot.forEach(function(childSnapshot) {
			var childData = childSnapshot.val();
			leadersList.push(childData.displayName);
		});
	});
	$scope.reportAction = function() {
		if (!$scope.user || !$scope.user.uid) {
			return false;
			$ionicPopup.alert({
				title: 'No USER!',
				template: "No userinfo was avail"
			}).then(function(res) {
				return false;
			});
		}
		var hasPointsAlready = $scope.user.points && $scope.user.points[$stateParams.memorizeId] && $scope.user.points[$stateParams.memorizeId].pointValue ? true : false;
		if ($rootScope.uid && $rootScope.currentUser && $rootScope.currentUser.groups && $rootScope.currentUser.groups.leaders) {
			// user is leader
			if ($scope.user && $scope.user.uid == $rootScope.uid) {
				$ionicPopup.alert({
					title: 'Leader FAIL!',
					template: "Sorry " + $rootScope.currentUser.firstName + ", even though you are a leader, you cannot give yourself points! See one of these other leaders:<br><br>" + leadersList.join("<br>")
				});
			} else {
				if (hasPointsAlready) {
					$ionicPopup.confirm({
						title: 'DELETE Reward Points',
						template: "CAREFUL! Are you sure you want to delete " + $scope.user.displayName + "'s " + $scope.memorize.pointValue + " points for " + $scope.memorize.title + "?",
						okType: 'button-assertive',
						okText: 'DELETE'
					}).then(function(res) {
						if(res) {
							Points.remove($stateParams.memorizeId, $scope.user.uid);
						} else {
							// cancelled
						}
					});
				} else {
					$ionicPopup.confirm({
						title: 'Confirm Reward Points',
						template: 'Are you sure you want to assign ' + $scope.user.displayName + ' ' + $scope.memorize.pointValue + ' points for ' + $scope.memorize.title + '?'
					}).then(function(res) {
						if(res) {
							var date = new Date();
							date.setHours(0);
							var pointInfo = {
								key: $stateParams.memorizeId,
								pointValue: $scope.memorize.pointValue,
								type: 'memorize',
								date: date,
								assignedByName: $rootScope.currentUser.displayName,
								assignedByUid: $rootScope.uid,
								title: "Memorized " + $scope.memorize.title + " for " + $scope.memorize.pointValue + " points on " + date.toISOString().split('T')[0]
							};
							Points.add(pointInfo, $scope.user.uid);
							$ionicPopup.alert({
								title: 'You have assigned points!',
								template: $scope.user.displayName + " has received " + $scope.memorize.pointValue + " points for " + $scope.memorize.title + "!"
							});
						} else {
							// cancelled
						}
					});
				}
			}
		} else {
			$ionicPopup.alert({
				title: 'Check with one of your leaders',
				template: "You cannot award yourself these points, only one of your leaders can.<br><br>" + leadersList.join("<br>")
			});
		}
	}
	$scope.doRefresh = function() {
		$scope.memorize = Memorize.get($stateParams.memorizeId);
		$scope.$broadcast('scroll.refreshComplete');
	}
})
