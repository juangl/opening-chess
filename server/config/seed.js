/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Match = mongoose.model('Match');


User.find({}).remove(function() {
  User.create({
    provider: 'local',
    name: 'Test User',
    un: 'test',
    email: 'test@test.com',
    password: 'test'
  }, {
    provider: 'local',
    role: 'admin',
    name: 'Admin',
    un: 'admin',
    email: 'admin@admin.com',
    password: 'admin'
  }, function() {

      Match.find({}).remove(function() {
        User.find(function(err, user) {
          Match.create({
            plys: {w: user[0], b: user[1]},
            s: 2
          });
        });
      })
      console.log('finished populating users');
    }
  );
});



/*
Match.find({}).remove(function() {
  User.find({}, function(err, users) {
    console.log(users);
    Match.create({
      players: {w: users, b: users}
    });
  });
});*/
