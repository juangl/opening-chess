'use strict';

angular.module('openingChessApp')
  .controller('WaitingRoomCtrl', function ($location, $scope, $modalInstance, Auth) {
    
    $scope.showRandom = false;
    $scope.showWhite  = true;
    $scope.showBlack  = true;

    $scope.showWhite = $scope.modal.matchData.plys.w === undefined;
    $scope.showBlack = $scope.modal.matchData.plys.b === undefined;
    $scope.showRandom = $scope.showBlack && $scope.showWhite;
    

    $scope.choose = function(color) {
      if (color === 'r') {
        color = Math.floor(Math.random() * 2) ? 'w' : 'b'; 
      }

      if (Auth.isLoggedIn()) {
        $modalInstance.close(color);
      } else {
        $modalInstance.dismiss();
        $location.path('/login');
      }
    };
  });
