/**
 * Main application routes
 */

'use strict';


var errors = require('./components/errors');
var express = require('express');
var glob   = require('glob');

module.exports = function(app, config) {

  var apiRoute = express.Router();
  var controllers = glob.sync(config.root + '/server/controllers/*.js');
  controllers.forEach(function (controller) {
    require(controller)(apiRoute);
  });

  app.use('/api', apiRoute);

  app.use('/auth', require('./auth'));

  app.use('/locale.json', function(req, res) {
    res.sendFile(config.root + '/server/locales/' + req.getLocale() + '.json');  
  });
  
  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|app|bower_components|styles|scripts|images|fonts)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      res.sendFile(app.get('appPath') + '/index.html');
    });
};
