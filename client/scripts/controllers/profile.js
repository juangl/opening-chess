'use strict';

angular.module('openingChessApp')
  .controller('ProfileCtrl', function ($scope, $routeParams) {
    
    $scope.userID = $routeParams.id;
  });
