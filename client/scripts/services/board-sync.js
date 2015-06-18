'use strict';

angular.module('openingChessApp')
  .factory('BoardSync', function(Modal) {
    function BoardSync(matchState, board) {
      this.matchID   = matchState.id;
      this.matchState = matchState;
      this.emitter = null;

      this.board = board;
      this.game = new Chess();

    }

    BoardSync.prototype = {
      setemitter: function(emitter) {
        this.emitter = emitter;
      },
      onViewerJoinAcepted: function() {
      },

      onPlayerJoinAcepted: function(color) {
        console.log(this);
        this.matchState.playingAs = color;
        if (color === 'b') {
          this.board.toggleOrientation();
        }
      },

      playerJoined: function(data) {
        this.matchState.joinPlayer(data);
        var gameStart = this.matchState.numOfPlayers() === 2;
        if (gameStart && this.matchState.playingAs !== null) {
          this.board.set({
            viewOnly: false,
            turnColor: 'white',
            animation: {
              duration: 500
            },
            movable: {
              free: false,
              color: this.chessToColor(this.matchState.playingAs),
              premove: true,
              dests: this.chessToDests(),
              events: {
                after: this.makeMove.bind(this)
              }
            },
            drawable: {
              enabled: true
            },
            premovable: {
              enabled: true,
              showDests: true,
              current: null
            }
          });
        }
      },

      onMove: function(move) {
        if (this.game.move(move)) {
          var moveVerbose = this.game.history({ verbose: true }).pop();
          this.board.move(moveVerbose.from, moveVerbose.to);
          this.toggleTurn();
          this.pushMove();
        }
      },

      makeMove: function(orig, dest) {
        this.game.move({from: orig, to: dest});
        this.toggleTurn();
        console.log(this.game.history());
        var move = this.game.history().pop();
        this.pushMove(move);
        this.emitter.move(move);
      },

      pushMove: function() {
        this.matchState.move(this.game.history().pop());
      },

      toggleTurn: function() {
        if (this.game.inCheck()) {
          this.board.setCheck();
        }
        this.board.set({
          turnColor: this.chessToColor(this.game.turn()),
          movable: {
            color: this.chessToColor(this.matchState.playingAs),
            dests: this.chessToDests()
          }
        });
      },

      onResigned: function() {

      },

      onError: function(msg) {
        console.log(msg);
      },

      joinGame: function(color) {
        this.emitter.joinGame(color);
      },

      chessToColor: function(color) {
         return (color == "w") ? "white" : "black";
      },


      chessToDests: function() {
        var dests = {};
        this.game.SQUARES.forEach(function(s) {
          var ms = this.game.moves({square: s, verbose: true});
          if (ms.length) dests[s] = ms.map(function(m) { return m.to; });
        }.bind(this));
        return dests;
      }
    };

    return BoardSync;
  });
