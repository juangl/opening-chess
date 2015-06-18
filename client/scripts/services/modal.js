'use strict';

angular.module('openingChessApp')
  .factory('Modal', function ($rootScope, $modal) {
    /**
     * Opens a modal
     * @param  {Object} scope      - an object to be merged with modal's scope
     * @param  {String} modalClass - (optional) class(es) to be applied to the modal
     * @return {Object}            - the instance $modal.open() returns
     */
    function openModal(scope, modalClass, controller) {
      var modalScope = $rootScope.$new();
      scope = scope || {};
      modalClass = modalClass || 'modal-default';

      angular.extend(modalScope, scope);

      return $modal.open({
        templateUrl: 'views/modal/modal.html',
        windowClass: modalClass,
        scope: modalScope,
        controller: controller
      });
    }

    // Public API here
    return {
      newMatch: function(callback) {
        callback = callback || angular.noop;

        /**
         * Open a create match modal
         */
        return function() {
          var newMatchModal = openModal({
            modal: {
              dismissable: true,
              title: 'Create new match!',
              include: 'views/modal/new-match.html'
            }
          }, 'modal-success', 'NewMatchModalCtrl');

          newMatchModal.result.then(function(event) {
            callback.apply(event);
          });

          return newMatchModal;
        };
      },

      waitingRoom: function(callback) {
        callback = callback || angular.noop;

        /**
         * Open a waiting room modal
         * @param  {Object} plys   - name or info to show on modal
         * @param  {All}           - any additional args are passed staight to del callback
         */
        return function() {
          var args = Array.prototype.slice.call(arguments),
              matchData = args.shift(),
              waitingModal;

          waitingModal = openModal({
            modal: {
              dismissable: true,
              title: 'Join the game!',
              include: 'views/modal/waiting-room.html',
              matchData: matchData,
              buttons: [{
                  classes: 'btn-danger',
                  text: 'No play',
                  click: function(e) {
                    waitingModal.dismiss(e);
                  }
                }]
            }
          }, 'modal-success', 'WaitingRoomCtrl');

          waitingModal.result.then(function(event) {
            callback(event);
          });
        };
      }, 

      /* Confirmation modals */
      confirm: {

        /**
         * Create a function to open a delete confirmation modal (ex. ng-click='myModalFn(name, arg1, arg2...)')
         * @param  {Function} del - callback, ran when delete is confirmed
         * @return {Function}     - the function to open the modal (ex. myModalFn)
         */
        delete: function(del) {
          del = del || angular.noop;

          /**
           * Open a delete confirmation modal
           * @param  {String} name   - name or info to show on modal
           * @param  {All}           - any additional args are passed staight to del callback
           */
          return function() {
            var args = Array.prototype.slice.call(arguments),
                name = args.shift(),
                deleteModal;

            deleteModal = openModal({
              modal: {
                dismissable: true,
                title: 'Confirm Delete',
                html: '<p>Are you sure you want to delete <strong>' + name + '</strong> ?</p>',
                buttons: [{
                  classes: 'btn-danger',
                  text: 'Delete',
                  click: function(e) {
                    deleteModal.close(e);
                  }
                }, {
                  classes: 'btn-default',
                  text: 'Cancel',
                  click: function(e) {
                    deleteModal.dismiss(e);
                  }
                }]
              }
            }, 'modal-danger');

            deleteModal.result.then(function(event) {
              del.apply(event, args);
            });
          };
        }
      }
    };
  });
