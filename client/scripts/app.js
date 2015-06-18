'use strict';

/**
 * @ngdoc overview
 * @name openingChessApp
 * @description
 * # openingChessApp
 *
 * Main module of the application.
 */
angular
  .module('openingChessApp', [
    'ngAria',
    'ngRoute',
    'ngTouch',
    'ngCookies',
    'ngAnimate',
    'ngMessages',
    'ngResource',
    'ngSanitize',
    'ui.gravatar',
    'ngClipboard',
    'view-segment',
    'ui.bootstrap',
    'route-segment',
    'btford.socket-io',
    'pascalprecht.translate'
  ]).config(function ($locationProvider, $httpProvider, $translateProvider, ngClipProvider) {

    ngClipProvider.setPath('/bower_components/zeroclipboard/dist/ZeroClipboard.swf');

    $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('authInterceptor');

    $translateProvider.useLoader('customLoader');
    $translateProvider.preferredLanguage('null');

      // Enable escaping of HTML
    $translateProvider.useSanitizeValueStrategy('escaped');
  })

  .factory('authInterceptor', function ($rootScope, $q, $cookieStore, $location) {
    return {
      // Add authorization token to headers
      request: function (config) {
        config.headers = config.headers || {};
        if ($cookieStore.get('token')) {
          config.headers.Authorization = 'Bearer ' + $cookieStore.get('token');
        }
        return config;
      },

      // Intercept 401s and redirect you to login
      responseError: function(response) {
        if(response.status === 401) {
          $location.path('/login');
          // remove any stale tokens
          $cookieStore.remove('token');
          return $q.reject(response);
        }
        else {
          return $q.reject(response);
        }
      }
    };
  })

  .factory('customLoader', function ($http, $q) {
    // return loaderFn
    return function () {
      var deferred = $q.defer();
      
      $http({
        method:'GET',
        url:'/locale.json'
      }).success(function (data) {
        deferred.resolve(data);
      }).error(function () {
        deferred.reject();
      });
      
      return deferred.promise;
    };
  })

  .run(function ($rootScope, $location, Auth, titleUpdater, $translate) {
    $translate('hola');
    $rootScope.title = '';
    // Redirect to login if route requires auth and you're not logged in
    $rootScope.$on('$routeChangeStart', function (event, next) {
      
      // Update title 
      var route = next.$route || next.$$route || {};
      var currentTitle = 'TITLE.' + (route.segment ? route.segment : '404_error');

      $translate(currentTitle).then(function (transTitle) {
         titleUpdater.setTitle(transTitle);
      });
      
      Auth.isLoggedInAsync(function(loggedIn) {
        if (next.authenticate && !loggedIn) {
          $location.path('/login');
        }
      });
    });
  });
