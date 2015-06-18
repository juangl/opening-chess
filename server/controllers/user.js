'use strict';

var passport = require('passport');
var mongoose = require('mongoose');
var express = require('express');
var User = mongoose.model('User');
var config = require('../config/environment');
var jwt = require('jsonwebtoken');
var auth = require('../auth/auth.service');

var router = express.Router();

var validationError = function(res, err) {
  return res.status(422).json(err);
};

/**
 * Get list of users
 * restriction: 'admin'
 */
router.get('/', auth.hasRole('admin'), function(req, res) {
  User.find({}, '-salt -hashedPassword', function (err, users) {
    if(err) return res.status(500).send(err);
    res.status(200).json(users);
  });
});

/**
 * Deletes a user
 * restriction: 'admin'
 */
router.delete('/:id', auth.hasRole('admin'), function(req, res) {
  User.findByIdAndRemove(req.params.id, function(err, user) {
    if(err) return res.status(500).send(err);
    return res.sendStatus(204);
  });
});

/**
 * Get my info
 */
router.get('/me', auth.isAuthenticated(), function(req, res, next) {
  var userId = req.user._id;
  User.findOne({
    _id: userId
  }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) return res.sendStatus(401);
    res.json(user);
  });
});

/**
 * Change a users password
 */
router.put('/:id/password', auth.isAuthenticated(), function(req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findById(userId, function (err, user) {
    if(user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function(err) {
        if (err) return validationError(res, err);
        res.sendStatus(200);
      });
    } else {
      res.sendStatus(403);
    }
  });
});

/**
 * Get a single user
 */
router.get('/:id', auth.isAuthenticated(), function (req, res, next) {
  var userId = req.params.id;

  User.findById(userId, function (err, user) {
    if (err) return next(err);
    if (!user) return res.sendStatus(401);
    res.json(user.profile);
  });
});

/**
 * Creates a new user
 */
router.post('/', function (req, res, next) {
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.role = 'user';
  newUser.save(function(err, user) {
    if (err) return validationError(res, err);
    var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
    res.json({ token: token });
  });
});

module.exports = function(app) {
  app.use('/users', router);
};
