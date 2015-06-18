'use strict';

angular.module('openingChessApp')
  .factory('MatchSocketController', function(Modal, SocketMatchClient) {
    function MatchSocketController(matchID, receiver) {
      this.socket   = new SocketMatchClient(matchID);
      this.receiver = receiver;
      this.init();
      this.bindEvents();
    }

    MatchSocketController.prototype = {
      setReceiver: function(receiver) {
        this.receiver = receiver;
      },

      init: function() {
        this.socket.emit('viewerJoin');
      },

      bindEvents: function() {
        this.registerEvent('viewerJoinAcepted', this.receiver.onViewerJoinAcepted);
        this.registerEvent('playerJoinAcepted', this.receiver.onPlayerJoinAcepted);
        this.registerEvent('playerJoined', this.receiver.playerJoined);
        this.registerEvent('move', this.receiver.onMove);
        this.registerEvent('resigned', this.receiver.onResigned);
        this.registerEvent('error', this.receiver.onError);
      },

      registerEvent: function(event, cb) {
        this.socket.on(event, cb.bind(this.receiver));
      },

      joinGame: function(color) {
        console.log(this);
        this.socket.emit('playerJoin', color);
      },

      move: function(move) {
        this.socket.emit('move', move);
      }
    };

    return MatchSocketController;
  });
