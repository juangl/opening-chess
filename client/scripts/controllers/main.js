'use strict';

angular.module('openingChessApp')
  .controller('MainCtrl', function ($scope, $http, socket, $location, $interval) {
    $scope.liveMatches = [];

    $scope.reload = function() {
      $scope.loading = true;
      $http.get('/api/matches/last').success(function(liveMatches) {
        $scope.liveMatches = liveMatches;
        console.log(liveMatches);
        $scope.loading = false;
      });        
    };

    $scope.reload();

    $scope.goToMatch = function(id) {
      $location.path('/match/' + id);
    };
    /*
    $scope.addThing = function() {
      if($scope.newThing === '') {
        return;
      }
      $http.post('/api/things', { name: $scope.newThing });
      $scope.newThing = '';
    };

    $scope.deleteThing = function(thing) {
      $http.delete('/api/things/' + thing._id);
    };

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('thing');
    });*/
  });
