// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function(config) {
  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: '../',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      // bower:js
      'bower_components/jquery/dist/jquery.js',
      'bower_components/es5-shim/es5-shim.js',
      'bower_components/angular/angular.js',
      'bower_components/json3/lib/json3.js',
      'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap.js',
      'bower_components/bootstrap/dist/js/bootstrap.js',
      'bower_components/angular-resource/angular-resource.js',
      'bower_components/angular-cookies/angular-cookies.js',
      'bower_components/angular-sanitize/angular-sanitize.js',
      'bower_components/angular-route/angular-route.js',
      'bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
      'bower_components/lodash/dist/lodash.compat.js',
      'bower_components/angular-socket-io/socket.js',
      'bower_components/angular-translate/angular-translate.js',
      'bower_components/angular-gravatar/build/angular-gravatar.js',
      'bower_components/chessjs/dist/chess.min.js',
      'bower_components/angular-route-segment/build/angular-route-segment.js',
      'bower_components/chessboard/lib/chessboard.min.js',
      'bower_components/zeroclipboard/dist/ZeroClipboard.js',
      'bower_components/ng-clip/src/ngClip.js',
      'bower_components/angular-aria/angular-aria.js',
      'bower_components/angular-touch/angular-touch.js',
      'bower_components/angular-animate/angular-animate.js',
      'bower_components/angular-messages/angular-messages.js',
      'bower_components/chessground/chessground.min.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'bower_components/angular-scenario/angular-scenario.js',
      // endbower
      'scripts/app.js',
      'scripts/**/*.js',
      'views/**/*.jade',
      'views/**/*.html',
      'test/**/*.js'
    ],

    preprocessors: {
      '**/*.jade': 'ng-jade2js',
      '**/*.html': 'html2js'
    },

    ngHtml2JsPreprocessor: {
      stripPrefix: 'client/'
    },

    ngJade2JsPreprocessor: {
      stripPrefix: 'client/'
    },

    // list of files / patterns to exclude
    exclude: [],

    // web server port
    port: 8080,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};
