'use strict';

angular.module('openingChessApp')
  .factory('Chessboard', function($rootScope) {
    function Chessboard(element, options) {
      this.ground = new Chessground(element);
      
      if (angular.isDefined(options)) {
        this.set(options);
      }
    }

    Chessboard.prototype = {
      set: function(options) {
        if (angular.isDefined(options.movable)         && 
            angular.isDefined(options.movable.events)  &&
            angular.isDefined(options.movable.events.after)) {
          var afterCB = options.movable.events.after;
          options.movable.events.after = function(){
            afterCB.apply(null, arguments);
            $rootScope.$apply();       
          };
        }

        if (angular.isDefined(options.events) && 
            angular.isDefined(options.events.move)) {
          var moveCB = options.events.move;
          options.events.move = function(){
            moveCB.apply(null, arguments);
            $rootScope.$apply();       
          };
        }
        return this.ground.set(options);
      },

      setCheck: function(color) {        
        $rootScope.$apply(function() {
          this.ground.setCheck(color);
        });
      },

      toggleOrientation: function() {
        var self = this;
        $rootScope.$apply(function() {
          self.ground.toggleOrientation();
        });
      },

      move: function(orig, dest) {
        var self = this;
        $rootScope.$apply(function() {
          self.ground.move(orig, dest);
        });
      },

      setPieces: function(piece) {
        var self = this;
        $rootScope.$apply(function() {
          self.ground.setPieces(piece);
        });
      },

      playPremove: function() {
        var self = this;
        $rootScope.$apply(function() {
          self.ground.playPremove();
        });
      },

      cancelPremove: function() {
        var self = this;
        $rootScope.$apply(function() {
          this.ground.cancelPremove();
        });
      },
      cancelMove: function() {
        var self = this;
        $rootScope.$apply(function() {
          self.ground.cancelMove();
        });
      },
      stop: function() {
        var self = this;
        $rootScope.$apply(function() {
          self.ground.stop();
        });
      }
    };

    return Chessboard;
  });
