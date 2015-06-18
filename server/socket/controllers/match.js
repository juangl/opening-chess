/**
 * Manage any socket conection for live games.
 *
 * @module socket/controllers/match
 */


/**
 * Socket server
 * @external socket.io
 * @see {@link http://socket.io/docs/server-api/}
 *
 * Socket object for connection
 * @external socket
 * @see {@link http://socket.io/docs/server-api/}
 *
 */



/** 
 *  ===========
 *   Events
 *  ===========
 *
 * Emitted by the client to watch a live game.
 *
 * @event viewerJoin
 * @property {number} matchID  - Match ID in database
 *
 * ---------------------------------
 *
 * Emitted by the server when an error occurs.
 *
 * @event error
 * @property {number} code - Code error
 * @property {string} message - Human description of error
 *
 * ---------------------------------
 *
 * Emitted by the server to indicate that the socket joined to the room.
 *
 * @event viewerJoinAcepted
 *
 * ---------------------------------
 *
 * Emitted by the client to play as [color].
 *
 * @event playerJoin
 * @property {string} color - 'w' for white or 'b' for black
 *
 * ---------------------------------
 *
 * Emitted by the client when makes a move or broadcast by the server when
 * the move is validated.
 *
 * @event move
 * @property {string} move - The move in SAN notation
 */

'use strict';

var Match = require('mongoose').model('Match');
var Chess = require('chessjs');
var async = require('async');

// keep matches online
var matches = {};

/*var numPlayersInRoom = {};
var chessEngine = {};*/

var io;
var nsp;

/**
 * Register socket controller
 *
 * @param {socket.io} sio - Socket server
 * @param {socket} socket - Socket of actual connection
 */
exports.register = function(sio, config) {
  io = sio;
  nsp = io.of('/match');

  nsp.use(require('socketio-jwt-decoder').authorize({
    secret: config.secrets.session
  }));

  // the follow will set matches if match is online, else, will emit an error
  nsp.use(function(socket, next) {
    var matchID = socket.handshake.query.match_id;

    if (matches[matchID] === undefined) {
      Match.findOne({_id: matchID}, function(err, data) {
        if (err) {
          next(new Error('Error unexpected.'));
        } else if (!data) {
          next(new Error('match no found.'));
        } else if (data.s !== 0) {
          next(new Error('match is not online.'));        
        } else {
          socket.matchID = matchID;
          socket.join(matchID);
          matches[matchID] = {};
          matches[matchID].data = data;
          matches[matchID].chess = new Chess();
          next();
        }
      });
    } else {
      socket.matchID = matchID;
      socket.join(matchID);
      next();
    }
  }); 
  
  nsp.on('connection', function(socket) {
    socket.on('viewerJoin', function(){
      var controller = new MatchCtrl(socket);
      controller.listen();
    });
  });
  
}

/**
 * @class
 */
function MatchCtrl(socket) {
  this.socket = socket;
  this.playingAs = null;
  this.matchID = socket.matchID;
  this.actualMatch = matches[this.matchID]; //keep as reference
  this.userID = null;
  if (socket.decoded_token !== undefined) {
    this.userID = socket.decoded_token._id;
  }
}


MatchCtrl.prototype = {
  errors: {
   3: 'you are not logged on.',
   4: 'you can\'t join to game.'
  },

  /**
   * Bind match events
   *
   * @listens viewerJoin
   */
  listen: function() {
    this.socket.on('playerJoin',     this.joinPlayer.bind(this));
    this.socket.on('move',               this.onMove.bind(this));
    this.socket.on('resignation', this.onResignation.bind(this));
    this.socket.emit('viewerJoinAcepted');
  },

  emitError: function(code) {
    this.socket.emit('error', {code: code, message: this.errors[code]});
  },

  joinPlayer: function(color) {
    console.log(this);
    if (this.userID !== null) {
      if (this.actualMatch.data.canJoinToPlay(color)) {

        this.actualMatch.data.plys[color] = this.userID;

        if (this.actualMatch.data.numOfPlayers() === 2) {
          this.actualMatch.data.s = 2;
        }

        this.actualMatch.data.save();

        this.socket.emit('playerJoinAcepted', color);
        var data = {color: color, id: this.userID};
        nsp.to(this.matchID).emit('playerJoined', data);
        this.playingAs = color;

        this.socket.on('disconnect', this.onAbortion.bind(this));
      } else {
        this.emitError(4);
      }
    } else {
      this.emitError(3);
    }
  },

  onMove: function(move) {
    if ( this.canMove() && this.actualMatch.chess.move(move)) {
      console.log('move');
      this.actualMatch.data.move(move);
      this.socket.broadcast.to(this.matchID).emit('move', move);

      if (this.actualMatch.chess.gameOver()) {
        this.endGame(this);
      }
    }
  },

  canMove: function() {
    return this.actualMatch.data.s  === 2
      && this.actualMatch.chess.turn() === this.playingAs;
  },

  endGame: function() {
    if (this.actualMatch.data.s === 0) {
      this.actualMatch.data.s = 1;
      this.actualMatch.data.save();
    } else if (this.actualMatch.data.s === 2) {
      this.actualMatch.data.s = 4;

      if (this.actualMatch.chess.inCheckmate() === true) { // is checkmate
        this.actualMatch.data.lo = this.actualMatch.chess.turn();
      } else if (this.actualMatch.chess.inDraw() === true) { // is Draw
        this.actualMatch.data.lo = null;
      } else { // is resignation
        this.actualMatch.data.s = 3;
        this.actualMatch.data.lo = this.playingAs;
        this.socket.broadcast.to(this.matchID).emit('resigned', this.playingAs);
      }

      this.actualMatch.data.save();
      delete matches[this.matchID];
    }
  },

  resignation: function() {
  
  },

  onResignation: function() {
    if (this.playingaAs !== null) {
      this.endGame();
    }
  },

  onAbortion: function() {
    this.endGame();  
  }
};

