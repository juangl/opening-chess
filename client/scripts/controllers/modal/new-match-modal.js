'use strict';

angular.module('openingChessApp')
  .controller('NewMatchModalCtrl', function ($scope, $location, $modalInstance, $http) {
    $scope.match = {};
    $scope.match.limited = true;
    $scope.match.limit = 10;
    $scope.match.increments = false;
    $scope.match.increment = 10;
    $scope.match.errors = {};
    $scope.match.isPrivate = false;
    $scope.match.playAs = 'w';

    $scope.createMatch = function() {
      var ck = {};

      if ($scope.match.limited) {
        ck.tl = $scope.match.limit;
        if ($scope.match.increments) {
          ck.ti = $scope.match.increment;        
        }
      }

      $http.post('/api/matches',  {
        p: $scope.match.isPrivate,
        ck: ck,
        s: 0,
        plys: {}
      }).
      success(function(data) {
        console.log(data);
        $modalInstance.close();
        $location.path('/match/' + data._id);
      }).
      error(function(data) {
        $modalInstance.dismiss();
        console.log('error: Unable create match.');
      });
    };
  });
