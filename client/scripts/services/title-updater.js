'use strict';

angular.module('openingChessApp')
  .factory('titleUpdater', function ($rootScope) {
    return {
      setParms: function(parms) {
        $rootScope.title = $rootScope.title.replace(/\{(\d)\}/g, function(m, index) {
          return parms[index];
        });
      },

      setTitle: function(title) {
        $rootScope.title = title;
      }
    };
  });
