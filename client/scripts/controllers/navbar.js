'use strict';

angular.module('openingChessApp')
  .controller('NavbarCtrl', function ($scope, $location, Auth, Modal) {
    $scope.isCollapsed = true;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $scope.getCurrentUser = Auth.getCurrentUser;

    $scope.logout = function() {
      Auth.logout();
      $location.path('/login');
    };

    $scope.isActive = function(route) {
      return route === $location.path();
    };

    $scope.newMatchModal = function() {
      if ($scope.isLoggedIn) {
        Modal.newMatch()();
      } else {
        $location.path('/signup');
      }
    };
  });
