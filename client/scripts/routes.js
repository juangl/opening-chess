'use strict';

/**
 * @ngdoc overview
 * @name openingChessApp
 * @description
 * # openingChessApp
 *
 * Main module of the application.
 */
angular.module('openingChessApp')
  .config(function ($routeProvider, $routeSegmentProvider) {

    $routeProvider
      .otherwise({
        templateUrl: 'views/404.html',
        controller: 'Error404Ctrl'
      });

    $routeSegmentProvider
      .when('/', 'main')

      .when('/login',              'login')
      .when('/signup',            'signup')
      .when('/settings',        'settings')
      .when('/profile/:user_id', 'profile')

      .when('/admin', 'admin')

      .when('/match/:matchID',  'match')

      .segment('main', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      
      .segment('login', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
      })
      .segment('signup', {
        templateUrl: 'views/signup.html',
        controller: 'SignupCtrl'
      })
      .segment('settings', {
        templateUrl: 'views/settings.html',
        controller: 'SettingsCtrl',
        authenticate: true
      })
      .segment('profile', {
        templateUrl: 'views/profile.html',
        controller: 'ProfileCtrl',
        dependencies: ['id']
      })
    
      .segment('admin', {
        templateUrl: 'views/admin.html',
        controller: 'AdminCtrl'
      })

      .segment('match', {
        templateUrl: 'views/match.html',
        controller: 'MatchCtrl',
        dependencies: ['matchID']
      });

  });
