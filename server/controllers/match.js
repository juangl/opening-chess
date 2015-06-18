'use strict';

var express = require('express');
var mongoose = require('mongoose');
var _ = require('lodash');
var auth = require('../auth/auth.service');
var Match = mongoose.model('Match');

var router = express.Router();

// Get list of matches
router.get('/', function(req, res) {
  Match.find({p: false}, function (err, matches) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(matches);
  });
});

// Get list of last matches
router.get('/last', function(req, res) {
  Match.find({p: false}, '-h')
    .sort({c: -1})  // sort by create date
    .limit(30)      // just 30 results
    .populate('plys.w', 'un')  //  return with
    .populate('plys.b', 'un')  //  players' information
    .exec(function (err, matches) {
      if(err) { return handleError(res, err); }
      return res.status(200).json(matches);
    });
});

// Get a single match
router.get('/:id', function(req, res) {
  Match.findById(req.params.id, function (err, match) {
    if(err) { return handleError(res, err); }
    if(!match) { return res.sendStatus(404); }
    return res.json(match);
  });
});

// Creates a new match in the DB.
router.post('/', auth.isAuthenticated(), function(req, res) {
  Match.create(req.body, function(err, match) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(match);
  });
});

// Updates an existing match in the DB.
router.put('/:id', auth.hasRole('admin'), function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Match.findById(req.params.id, function (err, match) {
    if (err) { return handleError(res, err); }
    if(!match) { return res.send(404); }
    var updated = _.merge(match, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(match);
    });
  });
});

// Deletes a match from the DB.
router.delete('/:id', auth.hasRole('admin'), function(req, res) {
  Match.findById(req.params.id, function (err, match) {
    if(err) { return handleError(res, err); }
    if(!match) { return res.send(404); }
    match.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
});


function handleError(res, err) {
  return res.send(500, err);
}

module.exports = function(app) {
  app.use('/matches', router);
};
