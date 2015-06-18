/* global io */
'use strict';

angular.module('openingChessApp')
  .factory('SocketMatchClient', function(socketFactory, Auth, $window) {
    return function(matchID) {
      var ioSocket = io($window.location.origin + '/match', {
        // Send auth token on connection
        query: 'match_id=' + matchID + '&token=' + Auth.getToken(),
        path:  '/socket.io-client'
      });

      var socket = socketFactory({
        ioSocket: ioSocket
      });

      return socket;
    }
  });
