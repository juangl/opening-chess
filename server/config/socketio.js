/**
 * Socket.io configuration
 */

'use strict';

var config = require('./environment');
var glob   = require('glob');

module.exports = function (socketio) {
  // In order to see all the debug output, set DEBUG (in server/config/local.env.js) to including the desired scope.
  //
  // ex: DEBUG: "http*,socket.io:socket"

  var socketsControllers = glob.sync(config.root + '/server/socket/controllers/*.js');
  socketsControllers.forEach(function (controller) {
    require(controller).register(socketio, config);
  });

  socketio.on('connection', function (socket) {

    console.info('[%s] CONNECTED', socket.address);

    socket.address = socket.handshake.address !== null ?
            socket.handshake.address.address + ':' + socket.handshake.address.port :
            process.env.DOMAIN;

    socket.connectedAt = new Date();

    // Call onDisconnect.
    socket.on('disconnect', function () {
      console.info('[%s] DISCONNECTED', socket.address);
    });

      // When the client emits 'info', this listens and executes
    socket.on('info', function (data) {
      console.info('[%s] %s', socket.address, JSON.stringify(data, null, 2));
    });
    
  });
};
