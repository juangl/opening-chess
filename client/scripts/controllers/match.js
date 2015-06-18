'use strict';

angular.module('openingChessApp')
  .controller('MatchCtrl', function ($scope, $routeParams, $http, titleUpdater, Modal, BoardSync, MatchState, Chessboard, MatchSocketController) {

    $scope.matchHistory = [];

    var matchID = $routeParams.matchID;

    var board = new Chessboard(angular.element('#main-board')[0]);
    board.set({viewOnly: true});

    var matchState = new MatchState(matchID);
    var chess = new Chess();
    var receiver = null;
    var emitter = null;

    matchState.promise.then(function() {
      if (matchState.data !== null) {
        _.forEach(matchState.data.h, function(move) {
          chess.move(move);
        });
        board.set({fen: chess.fen()});

        if (matchState.isLive()) {
          receiver = new BoardSync(matchState, board);
          emitter = new MatchSocketController(matchID, receiver);

          receiver.setemitter(emitter);

          if (matchState.isJoinable()) {
            Modal.waitingRoom(receiver.joinGame.bind(receiver))(matchState.data);
          }
        }

        $scope.matchHistory = matchState.data.h;
      }
      
    });

    titleUpdater.setParms(['hola' , 'hola']);
  });
