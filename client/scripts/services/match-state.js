'use strict';

angular.module('openingChessApp')
  .factory('MatchState', function($http, $q, $rootScope ,Auth) {
    function MatchState(matchID) {
      this.data = null;
      this.id = matchID;
      this.playingAs = null;
   
      var deferred = $q.defer();
      $http.get('/api/matches/' + matchID).success(function(data){
        this.data = data;
        this.data.plys = data.plys || {};
        deferred.resolve();
      }.bind(this));

      this.promise = deferred.promise;
    }

    MatchState.prototype = {
      isLive: function() {
        console.log(this);
        return this.data.s === 0 || this.data.s === 2;
      },

      isJoinable: function() {
        console.log(this);
        var currentUser = Auth.getCurrentUser()._id;
        return this.data.s === 0 && 
          (this.data.plys.b !== currentUser || this.data.plys.w !== currentUser);
      },

      numOfPlayers: function() {
        var num = 0;

        if (this.data.plys.b !== undefined) {
          num++;
        }

        if (this.data.plys.w !== undefined) {
          num++;
        }
        
        return num;
      },

      joinPlayer: function(data) {
        this.data.plys[data.color] = data.id;

        if (this.numOfPlayers() === 2) {
          this.data.s = 2;
        }
      },
  
      move: function(move) {
        this.data.h.push(move);
      }
    };

    return MatchState;
  });
