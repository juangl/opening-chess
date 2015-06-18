'use strict';

angular.module('openingChessApp')
  .factory('Match', function ($resource) {
    return $resource('/api/matches/:id/:controller', {
      id: '@_id'
    },
    {
      // no custom methods
    });
  });
