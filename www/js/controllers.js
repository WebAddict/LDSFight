angular.module('app.controllers', [])

.controller('LoginCtrl', function($scope, $state, $ionicHistory, $ionicPopup, $location, $ionicModal, $ionicLoading, $rootScope, $firebaseAuth, User, $firebaseObject, $localStorage) {
	if ($rootScope.uid) {
		$state.go('tabsController.feed');
	}
	$ionicModal.fromTemplateUrl('templates/signup.html?v=n29db', {
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
							user.groups.visitors = true;
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
	$scope.newProfilePhoto = function() {
		$ionicPopup.confirm({
			title: 'Update Profile Photo',
			template: 'You can update your Profile Photo on your Edit Account page. Would you like me to take you there?'
		}).then(function(res) {
			if(res) {
				$state.go('tabsController.account-edit');
			} else {
			}
		});
	}
	$scope.doRefresh = function() {
		$scope.$broadcast('scroll.refreshComplete');
	}
})

.controller('userEditCtrl', function($scope, $rootScope, $stateParams, $ionicLoading, $ionicPlatform, $ionicModal, User, Groups, Points, $ionicPopup, $ionicHistory, filepickerService, $cordovaCamera) {
	$scope.isMe = true;
	if ($stateParams.userId) {
		$scope.isMe = false;
		var user = User($stateParams.userId);
		user.$loaded().then(function(data) {
			$scope.userUid = $stateParams.userId;
			data.$bindTo($scope, "user").then(function() {
				data.displayName = data.firstName + " " + data.lastName;
				Points.reCalcPoints($stateParams.userId);
			});
		});
	} else if ($rootScope.uid && $rootScope.currentUser) {
		$scope.userUid = $rootScope.uid;
		var user = User($rootScope.uid);
		user.$loaded().then(function(data) {
			data.$bindTo($scope, "user").then(function() {
				data.displayName = data.firstName + " " + data.lastName;
				Points.reCalcPoints($rootScope.uid);
			});
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
		//console.log(JSON.stringify(Blob));
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
		//console.log(JSON.stringify(FPProgress));
	};

	$scope.groupsList = [];
	var groupsRef = firebase.database().ref().child('groups');
	groupsRef.once("value", function(snapshot) {
		$scope.groupsList = [];
		$scope.groups = snapshot.val();
		snapshot.forEach(function(childSnapshot) {
			var childData = childSnapshot.val();
			if ($scope.user && $scope.user.groups && $scope.user.groups[childSnapshot.key]) {
				$scope.groupsList.push(childData.displayName);
			}
		});
	});
	//var groups = Groups.all();
	//groups.$loaded().then(function(data) {
		//$scope.groups = data;
		//makeGroupList();
	//});
	var makeGroupList = function() {
		//$scope.groupsList = [];
		angular.forEach($scope.groups, function(rec, groupKey) {
			//console.log(rec, groupKey);
			if ($scope.user && $scope.user.groups && $scope.user.groups[rec.$id]) {
				$scope.groupsList.push(rec.displayName);
			}
		});
	}
	$ionicModal.fromTemplateUrl('templates/user-groups.html?v=n29db', {
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
		$scope.groupsList = [];
		angular.forEach($scope.groups, function(rec, groupKey) {
			var userGroupMemberRef = firebase.database().ref().child('groups').child(groupKey).child('members');
			if ($scope.user.groups[groupKey] === true) {
				userGroupMemberRef.child($scope.userUid).set({displayName: $scope.user.displayName});
				$scope.groupsList.push(rec.displayName);
			} else {
				userGroupMemberRef.child($scope.userUid).remove();
				firebase.database().ref().child('users').child($scope.userUid).child('groups').child(groupKey).remove();
			}
		});
		$ionicPopup.alert({
			title: 'Saved Groups',
			content: "Success"
		}).then(function(res) {
			if ($scope.userUid) {
				firebase.database().ref().child('users').child($scope.userUid).child('groupsList').set($scope.groupsList.join(', '));
			}
			$scope.modal.hide();
			$ionicLoading.hide();
		});
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
		var userRef = firebase.database().ref().child('users').child($stateParams.userId);
		userRef.on("value", function(snapshot) {
			$scope.user = snapshot.val();
			$scope.user.uid = $stateParams.userId;
		});
		var pointsList = Points.all();
		pointsList.$loaded().then(function(data) {
			$scope.pointsList = data;
		});
	} else if ($rootScope.uid && $rootScope.currentUser) {
		var userRef = firebase.database().ref().child('users').child($rootScope.uid);
		userRef.on("value", function(snapshot) {
			$scope.user = snapshot.val();
			$scope.user.uid = $rootScope.uid;
		});
		var pointsList = Points.all();
		pointsList.$loaded().then(function(data) {
			$scope.pointsList = data;
		});
	} else {
		$scope.user = null;
	}
	$scope.deletePoints = function (pointKey) {
		//console.log(pointKey);
		$ionicPopup.confirm({
			title: 'DELETE POINTS',
			template: 'Are you sure you want to Delete these points?'
		}).then(function(res) {
			if(res) {
				$ionicPopup.confirm({
					title: 'DELETE POINTS',
					template: 'Last Chance, this cannot be un-done. Are you sure you want to Delete these points?',
					okType: 'button-assertive',
					okText: 'DELETE'
				}).then(function(res) {
					if(res) {
						Points.remove(pointKey, $scope.user.uid);
						$ionicPopup.alert({
							title: 'Deleted Points!',
							content: "Successfully deleted points"
						});
					} else {
					}
				});
			} else {
			}
		});
	}
	$scope.doRefresh = function() {
		//console.log($stateParams.userId);
		$scope.$broadcast('scroll.refreshComplete');
	}
})

.controller('usersCtrl', function($scope, $rootScope, $stateParams, Users, Groups) {
	$scope.predicate = 'pointsTotal';
	$scope.reverse = true;
	$scope.searchText = "";
	$scope.headingText = "All Users";
	$scope.selectedGroup = 'allym';
	$scope.users = Users.all();
	$scope.$on('$stateChangeSuccess', function() {
		if ($rootScope.currentUser && $rootScope.currentUser.groups && $rootScope.currentUser.groups['deacons']) {
			$scope.selectedGroup = 'deacons';
			$scope.predicate = 'pointsTotal';
			$scope.reverse = true;
		} else if ($rootScope.currentUser && $rootScope.currentUser.groups && $rootScope.currentUser.groups['teachers']) {
			$scope.selectedGroup = 'teachers';
			$scope.predicate = 'pointsTotal';
			$scope.reverse = true;
		} else if ($rootScope.currentUser && $rootScope.currentUser.groups && $rootScope.currentUser.groups['priests']) {
			$scope.selectedGroup = 'priests';
			$scope.predicate = 'pointsTotal';
			$scope.reverse = true;
		} else if ($rootScope.currentUser && $rootScope.currentUser.groups && $rootScope.currentUser.groups['leaders']) {
			$scope.selectedGroup = 'allym';
			$scope.predicate = 'pointsTotal';
			$scope.reverse = true;
		} else if ($rootScope.currentUser && $rootScope.currentUser.groups && $rootScope.currentUser.groups['parents']) {
			$scope.selectedGroup = 'allym';
			$scope.predicate = 'pointsTotal';
			$scope.reverse = true;
		} else if ($rootScope.currentUser && $rootScope.currentUser.groups && $rootScope.currentUser.groups['adults']) {
			$scope.selectedGroup = 'adults';
			$scope.predicate = 'pointsTotal';
			$scope.reverse = true;
		} else if ($rootScope.currentUser && $rootScope.currentUser.groups && $rootScope.currentUser.groups['visitors']) {
			$scope.selectedGroup = 'visitors';
			$scope.predicate = 'pointsTotal';
			$scope.reverse = true;
		} else if ($rootScope.currentUser && $rootScope.currentUser.groups && $rootScope.currentUser.groups['kids']) {
			$scope.selectedGroup = 'kids';
			$scope.predicate = 'pointsTotal';
			$scope.reverse = true;
		}
	});
    $scope.$watch('searchText', function (newValue, oldValue) {
        if (newValue !== oldValue) {
			$scope.selectedGroup = null;
		}
    });
	$scope.order = function(predicate) {
		if ($scope.predicate === predicate) {
			$scope.reverse = !$scope.reverse;
		} else {
			if (predicate == 'pointsTotal') {
				$scope.reverse = true; // reverse by default
			} else {
				$scope.reverse = false;
			}
		}
		$scope.predicate = predicate;
		//$scope.lessons = orderBy($scope.lessons, predicate, $scope.reverse);
	};
	$scope.selectGroup = function(groupKey) {
		if (groupKey == $scope.selectedGroup) {
			$scope.selectedGroup = null;
			$scope.headingText = "All Users";
		} else {
			$scope.selectedGroup = groupKey;
			$scope.headingText = groupKey;
		}
	}
	$scope.totalPoints = 0;
	$scope.filterUsers = function(){
		return function(user){
			//var show = true;
			if ($scope.selectedGroup) {
				if ($scope.selectedGroup == 'none' && user && !user.groups) {
				} else if ($scope.selectedGroup == 'allym' && user && user.groups && (user.groups['deacons'] || user.groups['teachers'] || user.groups['priests'])) {
				} else if (!user || !user.groups || !user.groups[$scope.selectedGroup] || user.groups[$scope.selectedGroup] !== true) {
					return false;
				}
			}
			if ($scope.searchText) {
				if (user.firstName && !user.firstName.match($scope.searchText)) {
					return false;
				}
			}
			return true;
		}
	}
	$scope.reSyncList = function() {
		Users.reSyncList();
	}
	$scope.doRefresh = function() {
		$scope.users = Users.all();
		$scope.$broadcast('scroll.refreshComplete');
	}
})

.controller('userDetailCtrl', function($scope, $rootScope, $stateParams, $state, User, $firebaseObject, $ionicPopup, $ionicHistory) {
	var user = User($stateParams.userId);
	user.$loaded().then(function(data) {
		$scope.user = data;
	});
	$scope.isYM = function() {
		if ($scope.user && $scope.user.groups) {
			if ($scope.user.groups['deacons'] || $scope.user.groups['teachers'] || $scope.user.groups['priests']) {
				return true;
			}
		}
		return false;
	}
	$scope.canDeleteProfilePhoto = function() {
		if ($rootScope.currentUser && $rootScope.currentUser.groups && $rootScope.currentUser.groups['leaders'] && $rootScope.currentUser.groups['leaders'] === true) {
			return true;
		}
		return false;
	}
	$scope.deleteProfilePhoto = function() {
		if (!$scope.canDeleteProfilePhoto()) {
			$ionicPopup.alert({
				title: 'Delete Profile Photo',
				template: "You don't have permission to delete"
			});
		} else {
			$ionicPopup.confirm({
				title: 'Delete Profile Photo',
				template: "Are you sure you want to delete this user's Profile Photo?"
			}).then(function(res) {
				if(res) {
					firebase.database().ref().child('users').child($stateParams.userId).child('avatarUrl').remove();
				} else {
					// cancelled
				}
			});
		}
	}
	$scope.canDeletePoints = function() {
		if ($rootScope.uid == "sRGIklkF2zQ7xYZqh7p1gczZe0J3") {
			return true;
		}
		return false;
	}
	$scope.deletePoints = function() {
		if (!$scope.canDeletePoints()) {
			// only Rich can do this
			$ionicPopup.alert({
				title: 'Delete User',
				template: "You don't have permission to delete"
			});
		} else {
			$ionicPopup.confirm({
				title: 'Delete Points',
				template: "Are you sure you want to WIPE this user's Points?"
			}).then(function(res) {
				if(res) {
					firebase.database().ref().child('users').child($stateParams.userId).child('points').remove();
					firebase.database().ref().child('users').child($stateParams.userId).child('pointsTotal').set(0);
				} else {
					// cancelled
				}
			});
		}
	};
	$scope.canDeleteUser = function() {
		if ($rootScope.uid == "sRGIklkF2zQ7xYZqh7p1gczZe0J3") {
			return true;
		}
		return false;
	}
	$scope.deleteUser = function() {
		if (!$scope.canDeleteUser()) {
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
					$ionicPopup.confirm({
						title: 'Really Delete User?',
						template: 'Are you REALLY sure you want to delete this user?'
					}).then(function(res) {
						if(res) {
							firebase.database().ref().child('users').child($stateParams.userId).remove();
							firebase.database().ref().child('groups').child('adults').child('members').child($stateParams.userId).remove();
							firebase.database().ref().child('groups').child('deacons').child('members').child($stateParams.userId).remove();
							firebase.database().ref().child('groups').child('leaders').child('members').child($stateParams.userId).remove();
							firebase.database().ref().child('groups').child('parents').child('members').child($stateParams.userId).remove();
							firebase.database().ref().child('groups').child('priests').child('members').child($stateParams.userId).remove();
							firebase.database().ref().child('groups').child('teachers').child('members').child($stateParams.userId).remove();
							firebase.database().ref().child('groups').child('visitors').child('members').child($stateParams.userId).remove();
							firebase.database().ref().child('groups').child('kids').child('members').child($stateParams.userId).remove();
							$ionicHistory.goBack();
						} else {
							// cancelled
						}
					});
				} else {
					// cancelled
				}
			});
		}
	};
	$scope.canUpdateProfilePhoto = function() {
		if ($rootScope.uid == $stateParams.userId) {
			return true;
		}
		if ($rootScope.currentUser && $rootScope.currentUser.groups && $rootScope.currentUser.groups['leaders'] && $rootScope.currentUser.groups['leaders'] === true) {
			return true;
		}
		return false;
	}
	$scope.newProfilePhoto = function() {
		if ($scope.isMyGoals || $rootScope.uid == $stateParams.userId) {
			$ionicPopup.confirm({
				title: 'Update Profile Photo',
				template: 'You can update your Profile Photo on your Account page. Would you like me to take you there?'
			}).then(function(res) {
				if(res) {
					$state.go('tabsController.account');
				} else {
				}
			});
		} else {
			if ($scope.canUpdateProfilePhoto()) {
				$ionicPopup.confirm({
					title: 'Update Profile Photo',
					template: 'You can update ' + $scope.user.firstName + '\'s Profile Photo on their Account page. Would you like me to take you there?'
				}).then(function(res) {
					if(res) {
						$state.go("tabsController.users-detail-edit", { userId: $stateParams.userId});
					} else {
					}
				});
			}
		}
	}
	$scope.doRefresh = function() {
		$scope.user = User($stateParams.userId);
		//console.log($stateParams.userId);
		$scope.$broadcast('scroll.refreshComplete');
	}
})

.controller('feedCtrl', function($scope, $rootScope, Feed, $ionicHistory, $ionicPopup, $interval) {
	$scope.date = Date.now();
	var cancelInterval = $interval(function() {
		$scope.date = Date.now();
	}, 5000);
	$scope.post = {type: 'message', message: ''};
	$scope.predicate = 'dateTime';
	$scope.reverse = true;
	$scope.feedlist = Feed.all();
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
	$scope.savePost = function(postInfo) {
		if (!$rootScope.currentUser || !$rootScope.uid || !postInfo.type) {
			$ionicPopup.alert({
				title: 'Not Allowed',
				content: "You are not allowed to post here"
			});
		} else if (postInfo.type == "message" && (!postInfo.message || postInfo.message.length < 5)) {
			$ionicPopup.alert({
				title: 'Message Length',
				content: "Your Message is not Long Enough.<br>" + replyMessage
			});
		} else {
			var date = new Date();
			var post = {
				uid: $rootScope.uid,
				type: 'post',
				for: 'all',
				likes: 0,
				message: postInfo.message,
				isViewable: (moderateReply() ? false : true),
				timestamp: firebase.database.ServerValue.TIMESTAMP,
				dateTime: date.toISOString()
			}
			var feedRef = firebase.database().ref().child('feed');
			var newPostRef = feedRef.push();
			newPostRef.set(post);
			if (moderateReply()) {
				post.type = "feed";
				firebase.database().ref().child('moderation').child('feed').child(newPostRef.key).set(post);
			}
		}
	}
	$scope.canPost = function() {
		if ($rootScope.currentUser && $rootScope.currentUser.groups && ($rootScope.currentUser.groups['leaders'] || $rootScope.currentUser.groups['parents'] || $rootScope.currentUser.groups['deacons'] || $rootScope.currentUser.groups['teachers'] || $rootScope.currentUser.groups['priests'])) {
			return true
		}
		return false;
	}
	var moderateReply = function() {
		if ($rootScope.currentUser && $rootScope.currentUser.groups && ($rootScope.currentUser.noModerate || $rootScope.currentUser.groups['leaders'] || $rootScope.currentUser.groups['parents'])) {
			return false
		}
		return true;
	}
	$scope.filterFeed = function(){
		return function(feeditem){
			if (!feeditem.isViewable && !($rootScope.currentUser && $rootScope.currentUser.groups && $rootScope.currentUser.groups['leaders'] && $rootScope.currentUser.groups['leaders'] === true)) {
				return false;
			}
			if (feeditem.sticky) {
				return true;
			}
			if (feeditem.for && feeditem.for != 'all') {
				if ($rootScope.currentUser && $rootScope.currentUser.groups && $rootScope.currentUser.groups['leaders']) {
					// leaders can see all messages
				} else if ($rootScope.currentUser && $rootScope.currentUser.groups && !$rootScope.currentUser.groups['leaders']) {
					var forArray = feeditem.for.split(',');
					var isGroup = false;
					angular.forEach(forArray, function(groupKey, key) {
						if ($rootScope.currentUser.groups[groupKey]) {
							isGroup = true;
						}
					});
					if (!isGroup) {
						return false;
					}
				}
			}
			if ($scope.showingFuture) {
				return true;
			} else {
				var dateObj = new Date(feeditem.dateTime);
				return dateObj < new Date();
			}
		}
	}
	$scope.doRefresh = function() {
		$scope.feedlist = Feed.all();
		$scope.$broadcast('scroll.refreshComplete');
	}
})

.controller('contentDetailCtrl', function($scope, $rootScope, $stateParams, $ionicPopup, $interval) {
	$scope.replyMessage = "";
	$scope.predicate = 'timestamp';
	$scope.reverse = false;
	$scope.date = new Date();
	var cancelInterval = $interval(function() {
		$scope.date = Date.now();
	}, 1000);
	var contentRef = firebase.database().ref().child('content').child($stateParams.contentId);
	contentRef.on("value", function(snapshot) {
		$scope.content = snapshot.val();
		$scope.contentId = $stateParams.contentId;
		if ($scope.content.comments && $scope.content.comments === true) {
			var userInfos = [];
			$scope.messages = [];
			var messagesRef = firebase.database().ref().child('messages').child($stateParams.contentId);
			messagesRef.on("value", function(messagesSnapshot) {
				$scope.messages = [];
				//var messages = messagesSnapshot.val();
				messagesSnapshot.forEach(function(messageSnapshot) {
					var message = messageSnapshot.val();
					message.key = messageSnapshot.key;
					if (message.uid && !userInfos[message.uid]) {
						firebase.database().ref('/users/' + message.uid).once('value').then(function(userSnapshot) {
							var userInfo = {};
							userInfo.displayName = userSnapshot.val().displayName;
							userInfo.avatarUrl = userSnapshot.child("avatarUrl").exists() ? userSnapshot.val().avatarUrl : null;
							userInfos[message.uid] = userInfo;
							message.user = userInfo;
						});
					} else if (message.uid && userInfos[message.uid]) {
						message.user = userInfos[message.uid];
					}
					if (message && message.message) {
						$scope.messages.push(message);
					}
				});
			});
		}
	});
	$scope.deleteReply = function(message) {
		if (message && message.key) {
			firebase.database().ref().child('messages').child($stateParams.contentId).child(message.key).remove();
			firebase.database().ref().child('moderation').child($stateParams.contentId).child(message.key).remove();
		}
	}
	$scope.approveReply = function(message) {
		if (message && message.key) {
			firebase.database().ref().child('messages').child($stateParams.contentId).child(message.key).child('isViewable').set(true);
			firebase.database().ref().child('moderation').child($stateParams.contentId).child(message.key).remove();
		}
	}
	$scope.editReply = function(message) {
	}
	$scope.saveReply = function(replyMessage) {
		if (!$rootScope.currentUser || !$rootScope.uid) {
			$ionicPopup.alert({
				title: 'Not Allowed',
				content: "You are not allowed to post here"
			});
		} else if (!replyMessage || replyMessage.length < 5) {
			$ionicPopup.alert({
				title: 'Message Length',
				content: "Your Message is not Long Enough.<br>" + replyMessage
			});
		} else {
			var date = new Date();
			var message = {
				uid: $rootScope.uid,
				message: replyMessage,
				isViewable: (moderateReply() ? false : true),
				timestamp: firebase.database.ServerValue.TIMESTAMP,
				dateTime: date.toISOString()
			}
			var messagesRef = firebase.database().ref().child('messages').child($stateParams.contentId);
			var newMessageRef = messagesRef.push();
			newMessageRef.set(message);
			if (moderateReply()) {
				message.type = "content";
				firebase.database().ref().child('moderation').child($stateParams.contentId).child(newMessageRef.key).set(message);
			}
			$scope.replyMessage = "";
		}
	}
	$scope.canReply = function() {
		if ($rootScope.currentUser && $rootScope.currentUser.groups && ($rootScope.currentUser.groups['leaders'] || $rootScope.currentUser.groups['parents'] || $rootScope.currentUser.groups['deacons'] || $rootScope.currentUser.groups['teachers'] || $rootScope.currentUser.groups['priests'])) {
			return true
		}
		return false;
	}
	$scope.canDelete = function() {
		if ($rootScope.currentUser && $rootScope.currentUser.groups && ($rootScope.currentUser.groups['leaders'])) {
			return true
		}
		return false;
	}
	$scope.canApprove = function() {
		if ($rootScope.currentUser && $rootScope.currentUser.groups && ($rootScope.currentUser.groups['leaders'])) {
			return true
		}
		return false;
	}
	var moderateReply = function() {
		if ($rootScope.currentUser && $rootScope.currentUser.groups && ($rootScope.currentUser.noModerate || $rootScope.currentUser.groups['leaders'] || $rootScope.currentUser.groups['parents'])) {
			return false
		}
		return true;
	}
	$scope.filterMessages = function(){
		return function(message){
			//var show = true;
			if (message.uid == $rootScope.uid) {
				return true;
			}
			if (!message.isViewable && !($rootScope.currentUser && $rootScope.currentUser.groups && $rootScope.currentUser.groups['leaders'] && $rootScope.currentUser.groups['leaders'] === true)) {
				return false;
			}
			return true;
		}
	}
	$scope.doRefresh = function() {
		$scope.$broadcast('scroll.refreshComplete');
	}
})

.controller('moderationCtrl', function($scope, $rootScope, $stateParams, $ionicModal, $ionicPopup, $state, $ionicLoading) {
	$scope.approveReply = function(messageInfo, messageKey, parentKey) {
		if (messageInfo.type && messageKey && parentKey) {
			$ionicPopup.confirm({
				title: 'Approve this Message',
				template: 'Are you sure you want to Approve?'
			}).then(function(res) {
				if(res) {
					if (messageInfo.type == "feed") {
						var postRef = firebase.database().ref().child(parentKey).child(messageKey);
						postRef.once("value", function(postSnapshot) {
							// This is a FEED Post - not a post comment
							if (postSnapshot.exists()) {
								postRef.child('isViewable').set(true);
								postRef.child('approvedByUid').set($rootScope.uid);
								postRef.child('approvedTime').set(firebase.database.ServerValue.TIMESTAMP);
							}
						});
						firebase.database().ref().child('moderation').child(parentKey).child(messageKey).remove();
					} else if (messageInfo.type == "messages") {
						var messageRef = firebase.database().ref().child(messageInfo.type).child(parentKey).child(messageKey);
						messageRef.once("value", function(messageSnapshot) {
							if (messageSnapshot.exists()) {
								messageRef.child('isViewable').set(true);
								messageRef.child('approvedByUid').set($rootScope.uid);
								messageRef.child('approvedTime').set(firebase.database.ServerValue.TIMESTAMP);
							}
						});
						firebase.database().ref().child('moderation').child(parentKey).child(messageKey).remove();
					}
				} else {
				}
			});
		} else {
			$ionicPopup.alert({
				title: 'Missing Information',
				content: "Cannot complete Approval"
			});
		}
	}
	$scope.deleteReply = function(messageInfo, messageKey, parentKey) {
		if (messageInfo.type && messageKey && parentKey) {
			$ionicPopup.confirm({
				title: 'Delete this Message',
				template: 'Are you sure you want to Delete?'
			}).then(function(res) {
				if(res) {
					firebase.database().ref().child(parentKey).child(messageKey).remove();
					firebase.database().ref().child('moderation').child(parentKey).child(messageKey).remove();
				} else {
				}
			});
		} else {
			$ionicPopup.alert({
				title: 'Missing Information',
				content: "Cannot complete Approval"
			});
		}
	}
	//$scope.approveReply = function(message) {
	//	if (message && message.key) {
	//		firebase.database().ref().child('messages').child($stateParams.contentId).child(message.key).child('isViewable').set(true);
	//		firebase.database().ref().child('moderation').child($stateParams.contentId).child(message.key).remove();
	//	}
	//}
	$scope.doRefresh = function() {
		$scope.$broadcast('scroll.refreshComplete');
	}
})

.controller('goalsCtrl', function($scope, $rootScope, $stateParams, $ionicModal, Points, $ionicPopup, $state, $ionicLoading) {
	$scope.isMyGoals = true;
	if ($stateParams.userId) {
		$scope.isMyGoals = false;
		var userRef = firebase.database().ref().child('users').child($stateParams.userId);
		userRef.on("value", function(snapshot) {
			$scope.user = snapshot.val();
			$scope.user.uid = $stateParams.userId;
			$scope.user.wroteAllMissionaries = false;
			$scope.user.wroteMissionaryCount = 0;
			$scope.user.wroteMissionaryPoints = 0;
			$scope.user.broughtFriendsCount = 0;
			$scope.user.broughtFriendsPoints = 0;
			$scope.user.broughtFriendsList = [];
			$scope.user.classroomPoints = 0;
			$scope.user.socialPoints = 0;
			$scope.user.indexingPoints = 0;
			$scope.user.dutyToGodPoints = 0;
			$scope.user.lessonPoints = 0;
			$scope.user.journalPoints = 0;
			$scope.user.scripturePoints = 0;
			$scope.user.templePoints = 0;
			$scope.user.scoutingPoints = 0;
			if (snapshot.child('points').exists() && snapshot.child('points').hasChildren()) {
				snapshot.child('points').forEach(function(pointSnapshot) {
					var pointInfo = pointSnapshot.val();
					if (!pointInfo.type) {
						if (pointSnapshot.key && pointSnapshot.key == 'registration') {
							userRef.child('points').child(pointSnapshot.key).child('type').set('registration');
							pointInfo.type = 'registration';
						} else if (pointSnapshot.key && pointSnapshot.key.substring(0, 6) == 'lesson' && pointSnapshot.key.slice(-5) == 'bonus') {
							userRef.child('points').child(pointSnapshot.key).child('type').set('bonus');
							pointInfo.type = 'bonus';
						} else if (pointSnapshot.key && pointSnapshot.key.substring(0, 6) == 'lesson' && pointSnapshot.key.slice(-9) == 'challenge') {
							userRef.child('points').child(pointSnapshot.key).child('type').set('challenge');
							pointInfo.type = 'challenge';
						} else if (pointSnapshot.key && pointSnapshot.key.substring(0, 6) == 'lesson') {
							userRef.child('points').child(pointSnapshot.key).child('type').set('lesson');
							pointInfo.type = 'lesson';
						} else if (pointSnapshot.key && pointSnapshot.key.substring(0, 10) == 'scriptures') {
							userRef.child('points').child(pointSnapshot.key).child('type').set('scriptures');
							pointInfo.type = 'scriptures';
						} else if (pointSnapshot.key && pointSnapshot.key.substring(0, 9) == 'dutyToGod') {
							userRef.child('points').child(pointSnapshot.key).child('type').set('dutyToGod');
							pointInfo.type = 'dutyToGod';
						} else if (pointSnapshot.key && pointSnapshot.key.substring(0, 6) == 'temple') {
							userRef.child('points').child(pointSnapshot.key).child('type').set('temple');
							pointInfo.type = 'temple';
						} else if (pointSnapshot.key && pointSnapshot.key.substring(0, 9) == 'testimony') {
							userRef.child('points').child(pointSnapshot.key).child('type').set('testimony');
							pointInfo.type = 'testimony';
						} else if (pointSnapshot.key && pointSnapshot.key.substring(0, 8) == 'scouting') {
							userRef.child('points').child(pointSnapshot.key).child('type').set('scouting');
							pointInfo.type = 'scouting';
						}
					}
					if (pointInfo.type && pointInfo.type == 'missionary' && pointInfo.pointValue && pointInfo.pointValue > 0) {
						$scope.user.wroteMissionaryCount++;
						$scope.user.wroteMissionaryPoints += pointInfo.pointValue;
					}
					if (pointInfo.type && pointInfo.type == 'friendToChurch' && pointInfo.pointValue && pointInfo.pointValue != 0) {
						$scope.user.broughtFriendsCount++;
						$scope.user.broughtFriendsPoints += pointInfo.pointValue;
						if (pointInfo.friendName) {
							$scope.user.broughtFriendsList.push(pointInfo.friendName);
						}
					}
					if (pointInfo.type && pointInfo.type == 'classroom' && pointInfo.pointValue && pointInfo.pointValue != 0) {
						$scope.user.classroomPoints += pointInfo.pointValue;
					}
					if (pointInfo.type && pointInfo.type == 'social' && pointInfo.pointValue && pointInfo.pointValue != 0) {
						$scope.user.socialPoints += pointInfo.pointValue;
					}
					if (pointInfo.type && pointInfo.type == 'indexing' && pointInfo.pointValue && pointInfo.pointValue != 0) {
						$scope.user.indexingPoints += pointInfo.pointValue;
					}
					if (pointInfo.type && pointInfo.type == 'dutyToGod' && pointInfo.pointValue && pointInfo.pointValue != 0) {
						$scope.user.dutyToGodPoints += pointInfo.pointValue;
					}
					if (pointInfo.type && pointInfo.type == 'journal' && pointInfo.pointValue && pointInfo.pointValue != 0) {
						$scope.user.journalPoints += pointInfo.pointValue;
					}
					if (pointInfo.type && (pointInfo.type == 'lesson' || pointInfo.type == 'bonus' || pointInfo.type == 'challenge') && pointInfo.pointValue && pointInfo.pointValue != 0) {
						$scope.user.lessonPoints += pointInfo.pointValue;
					}
					if (pointInfo.type && pointInfo.type == 'temple' && pointInfo.pointValue && pointInfo.pointValue != 0) {
						$scope.user.templePoints += pointInfo.pointValue;
					}
					if (pointInfo.type && pointInfo.type == 'testimony' && pointInfo.pointValue && pointInfo.pointValue != 0) {
						$scope.user.testimonyPoints += pointInfo.pointValue;
					}
					if (pointInfo.type && pointInfo.type == 'scouting' && pointInfo.pointValue && pointInfo.pointValue != 0) {
						$scope.user.scoutingPoints += pointInfo.pointValue;
					}
				});
			}
			if ($scope.user.wroteMissionaryCount > 5) {
				$scope.user.wroteAllMissionaries = true;
			}
		});
	} else if ($rootScope.uid && $rootScope.currentUser) {
		var userRef = firebase.database().ref().child('users').child($rootScope.uid);
		userRef.on("value", function(snapshot) {
			$scope.user = snapshot.val();
			$scope.user.uid = $rootScope.uid;
			$scope.user.wroteAllMissionaries = false;
			$scope.user.wroteMissionaryCount = 0;
			$scope.user.wroteMissionaryPoints = 0;
			$scope.user.broughtFriendsCount = 0;
			$scope.user.broughtFriendsPoints = 0;
			$scope.user.broughtFriendsList = [];
			$scope.user.classroomPoints = 0;
			$scope.user.socialPoints = 0;
			$scope.user.indexingPoints = 0;
			$scope.user.dutyToGodPoints = 0;
			$scope.user.lessonPoints = 0;
			$scope.user.journalPoints = 0;
			$scope.user.scripturePoints = 0;
			$scope.user.templePoints = 0;
			$scope.user.testimonyPoints = 0;
			$scope.user.scoutingPoints = 0;
			if (snapshot.child('points').exists() && snapshot.child('points').hasChildren()) {
				snapshot.child('points').forEach(function(pointSnapshot) {
					var pointInfo = pointSnapshot.val();
					if (!pointInfo.type) {
						if (pointSnapshot.key && pointSnapshot.key == 'registration') {
							userRef.child('points').child(pointSnapshot.key).child('type').set('registration');
							pointInfo.type = 'registration';
						} else if (pointSnapshot.key && pointSnapshot.key.substring(0, 6) == 'lesson' && pointSnapshot.key.slice(-5) == 'bonus') {
							userRef.child('points').child(pointSnapshot.key).child('type').set('bonus');
							pointInfo.type = 'bonus';
						} else if (pointSnapshot.key && pointSnapshot.key.substring(0, 6) == 'lesson' && pointSnapshot.key.slice(-9) == 'challenge') {
							userRef.child('points').child(pointSnapshot.key).child('type').set('challenge');
							pointInfo.type = 'challenge';
						} else if (pointSnapshot.key && pointSnapshot.key.substring(0, 6) == 'lesson') {
							userRef.child('points').child(pointSnapshot.key).child('type').set('lesson');
							pointInfo.type = 'lesson';
						} else if (pointSnapshot.key && pointSnapshot.key.substring(0, 10) == 'scriptures') {
							userRef.child('points').child(pointSnapshot.key).child('type').set('scriptures');
							pointInfo.type = 'scriptures';
						} else if (pointSnapshot.key && pointSnapshot.key.substring(0, 9) == 'dutyToGod') {
							userRef.child('points').child(pointSnapshot.key).child('type').set('dutyToGod');
							pointInfo.type = 'dutyToGod';
						} else if (pointSnapshot.key && pointSnapshot.key.substring(0, 6) == 'temple') {
							userRef.child('points').child(pointSnapshot.key).child('type').set('temple');
							pointInfo.type = 'temple';
						} else if (pointSnapshot.key && pointSnapshot.key.substring(0, 9) == 'testimony') {
							userRef.child('points').child(pointSnapshot.key).child('type').set('testimony');
							pointInfo.type = 'testimony';
						} else if (pointSnapshot.key && pointSnapshot.key.substring(0, 8) == 'scouting') {
							userRef.child('points').child(pointSnapshot.key).child('type').set('scouting');
							pointInfo.type = 'scouting';
						}
					}
					if (pointInfo.type && pointInfo.type == 'missionary' && pointInfo.pointValue && pointInfo.pointValue > 0) {
						$scope.user.wroteMissionaryCount++;
						$scope.user.wroteMissionaryPoints += pointInfo.pointValue;
					}
					if (pointInfo.type && pointInfo.type == 'friendToChurch' && pointInfo.pointValue && pointInfo.pointValue != 0) {
						$scope.user.broughtFriendsCount++;
						$scope.user.broughtFriendsPoints += pointInfo.pointValue;
						if (pointInfo.friendName) {
							$scope.user.broughtFriendsList.push(pointInfo.friendName);
						}
					}
					if (pointInfo.type && pointInfo.type == 'classroom' && pointInfo.pointValue && pointInfo.pointValue != 0) {
						$scope.user.classroomPoints += pointInfo.pointValue;
					}
					if (pointInfo.type && pointInfo.type == 'social' && pointInfo.pointValue && pointInfo.pointValue != 0) {
						$scope.user.socialPoints += pointInfo.pointValue;
					}
					if (pointInfo.type && pointInfo.type == 'indexing' && pointInfo.pointValue && pointInfo.pointValue != 0) {
						$scope.user.indexingPoints += pointInfo.pointValue;
					}
					if (pointInfo.type && pointInfo.type == 'scriptures' && pointInfo.pointValue && pointInfo.pointValue != 0) {
						$scope.user.scripturePoints += pointInfo.pointValue;
					}
					if (pointInfo.type && pointInfo.type == 'dutyToGod' && pointInfo.pointValue && pointInfo.pointValue != 0) {
						$scope.user.dutyToGodPoints += pointInfo.pointValue;
					}
					if (pointInfo.type && pointInfo.type == 'journal' && pointInfo.pointValue && pointInfo.pointValue != 0) {
						$scope.user.journalPoints += pointInfo.pointValue;
					}
					if (pointInfo.type && (pointInfo.type == 'lesson' || pointInfo.type == 'bonus' || pointInfo.type == 'challenge') && pointInfo.pointValue && pointInfo.pointValue != 0) {
						$scope.user.lessonPoints += pointInfo.pointValue;
					}
					if (pointInfo.type && pointInfo.type == 'temple' && pointInfo.pointValue && pointInfo.pointValue != 0) {
						$scope.user.templePoints += pointInfo.pointValue;
					}
					if (pointInfo.type && pointInfo.type == 'testimony' && pointInfo.pointValue && pointInfo.pointValue != 0) {
						$scope.user.testimonyPoints += pointInfo.pointValue;
					}
					if (pointInfo.type && pointInfo.type == 'scouting' && pointInfo.pointValue && pointInfo.pointValue != 0) {
						$scope.user.scoutingPoints += pointInfo.pointValue;
					}
				});
			}
			if ($scope.user.wroteMissionaryCount > 5) {
				$scope.user.wroteAllMissionaries = true;
			}
		});
	} else {
		$scope.user = null;
	}
	var leadersList = [];
	var leadersRef = firebase.database().ref().child('groups').child('leaders').child('members');
	leadersRef.once("value", function(snapshot) {
		snapshot.forEach(function(childSnapshot) {
			var childData = childSnapshot.val();
			leadersList.push(childData.displayName);
		});
	});
	$ionicModal.fromTemplateUrl('templates/report-points.html?v=n29db', {
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
	$scope.missionaryKey = null;
	$scope.pickFromMissionaries = true;
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
		$scope.missionaryKey = null;
	}
	resetReportModal();
	$scope.$on('modal.hidden', function() {
		resetReportModal();
	});
	var round5 = function(x) {
		return Math.ceil(x/5)*5;
	}
	$scope.setPointValue = function(pointValue) {
		$scope.pointValue = round5(pointValue);
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
	$scope.reportWriteMissionary = function() {
		$scope.reportingType = 'missionary';
		$scope.pointInfo.date = new Date();
		$scope.pointInfo.date.setHours(0);
		$scope.pointValue = 200;
		$scope.pointInfo.missionaryKey = null;
		$scope.modal.show();
	}
	$scope.reportIndexing = function() {
		$scope.reportingType = 'indexing';
		$scope.pointInfo.date = new Date();
		$scope.pointInfo.date.setHours(0);
		$scope.pointValue = 10;
		$scope.modal.show();
	}
	$scope.reportSocial = function() {
		$ionicPopup.alert({
			title: 'Social Points',
			template: "Social Points are automatically generated when your Posts or Comments get LIKES! You are awarded 5 points per like"
		});
	}
	$scope.reportBringFriendChurch = function() {
		if ($rootScope.uid && $rootScope.currentUser && $rootScope.currentUser.groups && $rootScope.currentUser.groups.leaders) {
			$scope.reportingType = 'friendToChurch';
			$scope.pointInfo.date = new Date();
			$scope.pointInfo.date.setHours(0);
			$scope.pointValue = 1000;
			$scope.pointInfo.friendKey = null;
			$scope.modal.show();
		} else {
			$ionicPopup.alert({
				title: 'Bring a Friend to Church',
				template: "When you bring a friend to all three hours of church, you will be awarded 1,000 points! Check with one of the following leaders to have it awarded.<div style=\"font-size: 12px; line-height: 14px; margin: 15px 15px; font-style: italic;\">" + leadersList.join("<br>") + "</div>"
			});
		}
	}
	$scope.reportClassroom = function() {
		if ($rootScope.uid && $rootScope.currentUser && $rootScope.currentUser.groups && $rootScope.currentUser.groups.leaders) {
			$scope.reportingType = 'classroom';
			$scope.pointInfo.date = new Date();
			$scope.pointInfo.date.setHours(0);
			$scope.pointValue = 10;
			$scope.modal.show();
		} else {
			$ionicPopup.alert({
				title: 'Classroom Participation &amp; Bonus Points',
				template: "Your leaders can award (or take away) points for your participation!"
			});
		}
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
	$scope.doReport = function(formPointInfo) {
		var dateStart = new Date("2016-06-01T00:00:00-07:00");
		var dateEnd = new Date("2016-07-31T23:59:59-07:00");
		var today = new Date();
		today.setHours(0);
		var tomorrow = new Date();
		tomorrow.setHours(0);
		tomorrow.setDate(tomorrow.getDate() + 1);
		var date = new Date($scope.pointInfo.date);
		var title = null;
		date.setHours(0);
		if ($scope.reportingType == 'missionary' && !formPointInfo.missionaryKey) {
			$ionicPopup.alert({
				title: 'No Missionary Selected',
				content: "Please select a missionary! "
			});
		} else if ($scope.reportingType == 'friendToChurch' && (!formPointInfo.friendFirstName || !formPointInfo.friendLastName)) {
			$ionicPopup.alert({
				title: 'Friend Name Incomplete',
				content: "Please enter the Friend's Name!"
			});
		} else if (date < dateStart) {
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
				title = $scope.reportingType + " points on " + date.toISOString().split('T')[0];
			}
			if ($scope.reportingType == 'scriptures' || $scope.reportingType == 'journal') {
				key = $scope.reportingType + makeDateKey(date);
			}
			if ($scope.reportingType == 'missionary') {
				key = formPointInfo.missionaryKey;
				title = "Wrote Elder " + formPointInfo.missionaryKey + " on " + date.toISOString().split('T')[0];
			}
			if ($scope.reportingType == 'friendToChurch') {
				key = 'friendToChurch' + formPointInfo.friendFirstName.toLowerCase().replace(/\W/g, '') + formPointInfo.friendLastName.toLowerCase().replace(/\W/g, '');
				title = "Brought " + formPointInfo.friendFirstName + " " + formPointInfo.friendLastName + " to Church on " + date.toISOString().split('T')[0];
			}
			if ($scope.reportingType == 'classroom') {
				key = 'classroom' + Date.now();
				title = $rootScope.currentUser.displayName + " awarded " + $scope.pointValue + " Classroom/Bonus Points on " + date.toISOString().split('T')[0];
				if (formPointInfo.message && formPointInfo.message.length > 0) {
					title = title + " - " + formPointInfo.message;
				}
			}
			if (!key) {
				key = null;
			}
			var pointInfo = {
				key: key,
				pointValue: $scope.pointValue,
				type: $scope.reportingType,
				date: date,
				title: title ? title : $scope.reportingType + " points on " + date.toISOString().split('T')[0]
			};
			if ($scope.reportingType == 'friendToChurch') {
				pointInfo.friendName = formPointInfo.friendFirstName + " " + formPointInfo.friendLastName;
			}
			if (formPointInfo.message && formPointInfo.message.length > 0) {
				pointInfo.message = formPointInfo.message;
			}
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
	$scope.reSyncList = function() {
		Lessons.reSyncList();
	}
	$scope.doRefresh = function() {
		//$scope.lessons = Lessons.all();
		$scope.$broadcast('scroll.refreshComplete');
	}
	$scope.order = function(predicate) {
		$scope.predicate = predicate;
		$scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
		$scope.lessons = orderBy($scope.lessons, predicate, $scope.reverse);
	};
	$scope.filterPosts = function(){
		return function(lesson){
			if (lesson.for && lesson.for != 'all') {
				if ($scope.user && $scope.user.groups && $scope.user.groups['leaders']) {
					// leaders can see call messages
				} else if ($scope.user && $scope.user.groups && !$scope.user.groups['leaders']) {
					var forArray = lesson.for.split(',');
					var isGroup = false;
					angular.forEach(forArray, function(groupKey, key) {
						if ($scope.user.groups[groupKey]) {
							isGroup = true;
						}
					});
					if (!isGroup) {
						return false;
					}
				}
			}
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
	$ionicModal.fromTemplateUrl('templates/report-points.html?v=n29db', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal){
		$scope.modal = modal;
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
					} else if (rec.$id == 'scouting') {
						data[key].actionKey = 'scouting' + makeWeekKey();
					} else if (rec.$id == 'temple') {
						data[key].actionKey = 'temple' + makeWeekKey();
					} else if (rec.$id == 'testimony') {
						data[key].actionKey = 'testimony' + makeWeekKey();
					} else if (rec.$id == 'challenge') {
						data[key].actionKey = $scope.lessonId + 'challenge';
					} else if (rec.$id == 'bonus') {
						data[key].actionKey = $scope.lessonId + 'bonus';
					} else {
						data[key].actionKey = rec.$id;
					}
					pointTotal += rec.pointValue ? rec.pointValue : 0;
				});
				$scope.actions = data;
				$scope.pointTotal = pointTotal;
			} else {
				$scope.actions = null;
			}
		});
	}
	var lessonRef = firebase.database().ref().child('lessons').child($stateParams.lessonId);
	lessonRef.on("value", function(snapshot) {
		$scope.lesson = snapshot.val();
		$scope.lessonId = $stateParams.lessonId;
		getActions();
	});
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

.controller('rewardsCtrl', function($scope, $rootScope, Rewards) {
	$scope.date = new Date();
	$scope.predicate = 'dateClaim';
	$scope.isYM = function() {
		if ($rootScope.currentUser && $rootScope.currentUser.groups) {
			if ($rootScope.currentUser.groups['deacons'] || $rootScope.currentUser.groups['teachers'] || $rootScope.currentUser.groups['priests']) {
				return true;
			} else if ($rootScope.uid == 'sRGIklkF2zQ7xYZqh7p1gczZe0J3') {
				return true;
			}
		}
		return false;
	}
	$scope.reverse = false;
	$scope.showingFuture = true;
	$scope.rewards = Rewards.all();
	$scope.doRefresh = function() {
		$scope.rewards = Rewards.all();
		$scope.$broadcast('scroll.refreshComplete');
	}
	$scope.order = function(predicate) {
		if ($scope.predicate === predicate) {
			$scope.reverse = !$scope.reverse;
		} else {
			if (predicate == 'points') {
				$scope.reverse = false; // reverse by default
			} else {
				$scope.reverse = false;
			}
		}
		$scope.predicate = predicate;
	};
	$scope.showingClaimed = true;
	$scope.showClaimedBtn = "Showing Claimed";
	$scope.showClaimed = function() {
		if ($scope.showingClaimed) {
			$scope.showingClaimed = false;
			$scope.showClaimedBtn = "Hiding Claimed";
		} else {
			$scope.showingClaimed = true;
			$scope.showClaimedBtn = "Showing Claimed";
		}
	};
	$scope.filterRewards = function(){
		return function(reward){
			if (!$scope.showingClaimed) {
				if (reward.isClaimed) {
					return false;
				}
			}
			if ($scope.showingFuture) {
				return true;
			} else {
				var dateObj = new Date(reward.dateClaim);
				return dateObj < new Date();
			}
		}
	}
})

.controller('rewardsDetailCtrl', function($scope, $rootScope, $stateParams, Rewards, $ionicPopup, $timeout) {
	$scope.date = new Date();
	$scope.timestamp = Date.now();
	//$scope.reward = Rewards.get($stateParams.rewardId);
	$scope.showClaimButton = false;
	$scope.isClaimable = false;
	$scope.isMine = false;
	$scope.isYM = function() {
		if ($rootScope.currentUser && $rootScope.currentUser.groups) {
			if ($rootScope.currentUser.groups['deacons'] || $rootScope.currentUser.groups['teachers'] || $rootScope.currentUser.groups['priests']) {
				return true;
			} else if ($rootScope.uid == 'sRGIklkF2zQ7xYZqh7p1gczZe0J3') {
				return true;
			}
		}
		return false;
	}
	var rewardRef = firebase.database().ref().child('rewards').child($stateParams.rewardId);
	rewardRef.on("value", function(snapshot) {
		var timeNow = new Date();
		var pointsSpent = $rootScope.currentUser.pointsSpent ? $rootScope.currentUser.pointsSpent : 0;
		var pointsAvailable = $rootScope.currentUser.pointsTotal - pointsSpent;
		$scope.showClaimButton = false;
		$scope.isClaimable = false;
		$scope.isMine = false;
		$scope.reward = snapshot.val();
		$scope.rewardId = $stateParams.rewardId;
		if ($scope.reward.dateClaim) {
			var dateClaimObj = new Date($scope.reward.dateClaim);
			if ($scope.reward.points && $scope.isYM()) {
				if ($scope.reward.isClaimed) {
					if ($scope.reward.claimedUid && $scope.reward.claimedUid == $rootScope.uid) {
						var unClaimUntil = new Date($scope.reward.claimedDateTime);
						unClaimUntil.setMinutes(unClaimUntil.getMinutes()+2);
						if (unClaimUntil > timeNow) {
							$scope.showClaimButton = true;
							timeLeft = unClaimUntil - timeNow;
							$timeout(function () {
								if ($scope.reward.isClaimed && $scope.reward.claimedUid && $scope.reward.claimedUid == $rootScope.uid && unClaimUntil > timeNow) {
									$scope.showClaimButton = false;
								}
							}, timeLeft);
						}
						$scope.isClaimable = false;
						$scope.isMine = true;
						$scope.unClaimUntil = unClaimUntil.toISOString();
					} else {
					}
				} else {
					$scope.showClaimButton = true;
					if (dateClaimObj && dateClaimObj < timeNow) {
						$scope.isClaimable = true;
					} else if (dateClaimObj && dateClaimObj > timeNow) {
						$scope.isClaimable = false;
					}
				}
			}
		} else {
		}
	});
	$scope.claimReward = function() {
		var timeNow = new Date();
		var pointsSpent = $rootScope.currentUser.pointsSpent ? $rootScope.currentUser.pointsSpent : 0;
		var pointsAvailable = $rootScope.currentUser.pointsTotal - pointsSpent;
		if ($scope.reward.dateClaim) {
			var dateClaimObj = new Date($scope.reward.dateClaim);
			if ($scope.reward.isClaimed && $scope.reward.claimedUid != $rootScope.uid) {
				$ionicPopup.alert({
					title: "Already Claimed",
					content: "This reward was claimed by " + $scope.reward.claimedDisplayName
				});
			} else if ($scope.reward.isClaimed && $scope.reward.claimedUid != $rootScope.uid) {
				$ionicPopup.alert({
					title: "Already Claimed",
					content: "This reward was claimed by " + $scope.reward.claimedDisplayName
				});
			} else if ($scope.reward.isClaimed && $scope.reward.claimedUid == $rootScope.uid) {
				$ionicPopup.confirm({
					title: "Undo Claim?",
					template: "Would you like to change your mind and return this reward to be claimed by someone else?",
					okType: 'button-positive',
					okText: 'Yes, Return!'
				}).then(function(res) {
					if(res) {
						if (Rewards.unclaim($stateParams.rewardId)) {
							$ionicPopup.alert({
								title: "Success",
								content: "You have unclaimed this reward"
							});
						}
					} else {
						// cancelled
					}
				});
			} else if (pointsAvailable < $scope.reward.points) {
				$ionicPopup.alert({
					title: "Not Enough Points",
					content: "You only have " + pointsAvailable + " points to spend"
				});
			} else if (dateClaimObj > timeNow) {
				$ionicPopup.alert({
					title: "You can't claim yet",
					content: "This Item isn't available quite yet"
				}).then(function(res) {
					return false;
				});
			} else {
				$ionicPopup.confirm({
					title: 'Confirm Claim Reward',
					template: "Are you sure you want to claim this reward?",
					okType: 'button-positive',
					okText: 'CLAIM!'
				}).then(function(res) {
					if(res) {
						if (Rewards.claim($stateParams.rewardId)) {
							$ionicPopup.alert({
								title: "Success",
								content: "You have claimed this reward. It will be given to you at Church on Sunday"
							});
						}
					} else {
						// cancelled
					}
				});
			}
		} else {
			$ionicPopup.alert({
				title: "This item is not available",
				content: "This Item isn't available to claim"
			}).then(function(res) {
				return false;
			});
		}
	}
	$scope.doRefresh = function() {
		//$scope.reward = Rewards.get($stateParams.rewardId);
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

.controller('missionariesDetailCtrl', function($scope, $rootScope, $stateParams, Missionaries, $ionicModal, Points, $ionicPopup, $ionicLoading) {
	$scope.missionary = Missionaries.get($stateParams.missionaryId);
	$scope.missionaryKey = $stateParams.missionaryId;
	$scope.pickFromMissionaries = false;
	$scope.doRefresh = function() {
		$scope.missionary = Missionaries.get($stateParams.missionaryId);
		$scope.$broadcast('scroll.refreshComplete');
	}
	$ionicModal.fromTemplateUrl('templates/report-points.html?v=n29db', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal){
		$scope.modal = modal;
	});
	var date = new Date();
	$scope.pointValue = 200;
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
	$scope.reportWriteMissionary = function() {
		if ($rootScope.currentUser && $rootScope.currentUser.points && $rootScope.currentUser.points[$stateParams.missionaryId] && $rootScope.currentUser.points[$stateParams.missionaryId].pointValue) {
			var confirmPopup = $ionicPopup.confirm({
				title: 'Delete this Missionary Points',
				template: 'Are you sure you want to delete this 200 Points? This action CANNOT be undone!'
			});
			confirmPopup.then(function(res) {
				if(res) {
					Points.remove($stateParams.missionaryId);
				} else {
				}
			});
		} else {
			$scope.reportingType = 'missionary';
			$scope.pointInfo.date = new Date();
			$scope.pointInfo.date.setHours(0);
			$scope.pointValue = 200;
			$scope.pointInfo.missionaryKey = $stateParams.missionaryId;
			$scope.modal.show();
		}
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

			var pointInfo = {
				key: $stateParams.missionaryId,
				pointValue: $scope.pointValue,
				type: $scope.reportingType,
				date: date,
				title: "Wrote " + $scope.missionary.displayName + " and got " + $scope.pointValue + " points on " + date.toISOString().split('T')[0]
			};
			Points.add(pointInfo, $rootScope.uid);
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
})

.controller('missionariesDetailLettersCtrl', function($scope, $stateParams, Missionaries, FeedService) {
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

.controller('missionariesDetailRssCtrl', function($scope, $stateParams, Missionaries, FeedService) {
	$scope.missionary = Missionaries.get($stateParams.missionaryId);

	var missionaryRssRef = firebase.database().ref().child('missionaries').child($stateParams.missionaryId).child('rss');
	missionaryRssRef.once("value", function(snapshot) {
		var rssFeed = snapshot.val();
		FeedService.parseFeed(rssFeed).then(function(res){
			$scope.feeds=res.data.responseData.feed.entries;
		});
	});

	$scope.doRefresh = function() {
		$scope.$broadcast('scroll.refreshComplete');
	}
})

.controller('missionariesDetailRssDetailCtrl', function($scope, $stateParams, Missionaries, FeedService) {
	$scope.missionary = Missionaries.get($stateParams.missionaryId);

	var missionaryRssRef = firebase.database().ref().child('missionaries').child($stateParams.missionaryId).child('rss');
	missionaryRssRef.once("value", function(snapshot) {
		var rssFeed = snapshot.val();
		FeedService.parseFeed(rssFeed).then(function(res){
			$scope.feed = res.data.responseData.feed.entries[$stateParams.feedId];
		});
	});

	$scope.doRefresh = function() {
		$scope.$broadcast('scroll.refreshComplete');
	}
})

.controller('dailyCtrl', function($scope, $rootScope, $state, $stateParams, User, Points, $ionicPopup) {
	$scope.isMyList = true;
	if ($stateParams.userId) {
		$scope.isMyList = false;
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
	$scope.listType = 'scriptures';
	$scope.setListType = function(type) {
		$scope.listType = type;
		buildDateList();
	}
	var buildDateList = function() {
		$scope.dateList = [];
		var dateStart = new Date("2016-06-01T00:00:00-07:00");
		var weekDateStart = new Date("2016-05-29T00:00:00-07:00");
		var dateEnd = new Date("2016-07-31T23:59:59-07:00");
		var today = new Date();
		//today.setHours(0);
		if (today < dateEnd) {
			var dateStop = today;
		} else {
			var dateStop = dateEnd;
		}
		var thisDate = new Date(dateStop);
		thisDate.setHours(0);
		if ($scope.listType == 'temple' || $scope.listType == 'dutyToGod' || $scope.listType == 'scouting' || $scope.listType == 'testimony') {
			var jump = 7;
			dateStart = weekDateStart;
		} else {
			var jump = 1;
		}
		while (thisDate > dateStart) {
			var dateInfo = {}
			if (thisDate >= dateStart) {
				if ($scope.listType == 'temple' || $scope.listType == 'dutyToGod' || $scope.listType == 'scouting' || $scope.listType == 'testimony') {
					var thisWeekStart = new Date(thisDate);
					if (thisDate.getDate() - thisDate.getDay() < 1) {
						thisWeekStart.setDate(0);
						thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
					} else {
						thisWeekStart.setDate(thisDate.getDate() - thisDate.getDay());
					}
					var thisWeekEnd = new Date(thisDate);
					thisWeekEnd.setDate(thisWeekStart.getDate() + 6);
					dateInfo.dateKey = $scope.listType + makeWeekKey(thisDate);
					dateInfo.title = "Week: " + thisWeekStart.toDateString() + " to " + thisWeekEnd.toDateString();
				} else if ($scope.listType == 'lesson') {
					dateInfo.dateKey = $scope.listType + makeDayKey(thisDate);
					dateInfo.title = thisDate.toDateString();
				} else {
					dateInfo.dateKey = $scope.listType + makeDateKey(thisDate);
					dateInfo.title = thisDate.toDateString();
				}
				$scope.dateList.push(dateInfo);
			}
			thisDate.setDate(thisDate.getDate() - jump);
		}
	}
	buildDateList();
	$scope.addPoints = function(dateKey) {
		if ($scope.listType == 'scriptures') {
			$ionicPopup.confirm({
				title: 'Add Points',
				template: "Are you sure you want to add this " + dateKey + " Points?"
			}).then(function(res) {
				if(res) {
					var pointInfo = {}
					pointInfo.type = $scope.listType;
					pointInfo.key = dateKey;
					pointInfo.pointValue = 100;
					Points.add(pointInfo, $scope.user.uid);
				}
				$scope.$broadcast('closeOptions');
			});
		} else if ($scope.listType == 'lesson') {
			$ionicPopup.confirm({
				title: 'Add Points',
				template: 'You can add your lesson points on your Lesson page. Would you like me to take you there?'
			}).then(function(res) {
				if(res) {
					$state.go('tabsController.lessons');
				} else {
				}
			});
		} else {
			$ionicPopup.confirm({
				title: 'Add Points',
				template: "You can add your " + $scope.listType + " points on your Goals page. Would you like me to take you there?"
			}).then(function(res) {
				if(res) {
					$state.go('tabsController.goals');
				} else {
				}
			});
		}
	}
	$scope.deletePoints = function(dateKey) {
		$ionicPopup.confirm({
			title: 'Delete Points',
			template: "Are you sure you want to delete this " + dateKey + " Points?"
		}).then(function(res) {
			if(res) {
				Points.remove(dateKey, $scope.user.uid);
			}
			$scope.$broadcast('closeOptions');
		});
	}
	$scope.doRefresh = function() {
		buildDateList();
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
					template: "Sorry " + $rootScope.currentUser.firstName + ", even though you are a leader, you cannot give yourself points! See one of these other leaders:<div style=\"font-size: 12px; line-height: 14px; margin: 15px 15px; font-style: italic;\">" + leadersList.join("<br>") + "</div>"
				});
			} else {
				if (hasPointsAlready) {
					$ionicPopup.confirm({
						title: 'DELETE Memorize Points',
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
				template: "You cannot award yourself these points, only one of your leaders can.<div style=\"font-size: 12px; line-height: 14px; margin: 15px 15px; font-style: italic;\">" + leadersList.join("<br>") + "</div>"
			});
		}
	}
	$scope.doRefresh = function() {
		$scope.memorize = Memorize.get($stateParams.memorizeId);
		$scope.$broadcast('scroll.refreshComplete');
	}
})
