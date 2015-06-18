'use strict';

var mongoose = require('mongoose');
var shortid = require('shortid');
var Schema = mongoose.Schema;
var clockType = ['normal', 'fischer', 'bronstein']; //fischer: time at start count
var state = ['wainting', 'aborted','playing', 'resigned', 'played'];

var MatchSchema = new Schema({
  _id: {
    type: String,
    unique: true,
    'default': shortid.generate
  },
  c: { type : Date, default: Date.now }, // created at
  plys: { //players
    w: {type: String, ref: 'User'}, 
    b: {type: String, ref: 'User'}
  },
  ck: {
    tl: Number, // time limit
    ct: Number, // clock type
    ti: Number  // time increment
  },
  h: [],        // history of moves
  s: Number,    // state
  p: Boolean,   // private
  lm: Date,     // Last move
  sg: Date,     // Start game
  lo:  String   // Loser: 'w' or 'b' or null for draw
});

MatchSchema.path('s').validate(function (value) {
    return value >= 0 && value <= 4;
});

MatchSchema.path('lo').validate(function (value) {
    return value === null || value === 'w' || value === 'b';
});

MatchSchema.methods.move = function(move) {
    this.h.push(move);
    this.lm = Date.now();
    this.save();
};

MatchSchema.methods.numOfPlayers = function() {
  var num = 0;
  if (this.plys && this.plys.w) {
    num++;
  }

  if (this.plys && this.plys.b) {
    num++;
  }
  return num;
};

MatchSchema.methods.canJoinToPlay = function(color) {    
  if (this.plys !== undefined && this.plys[color] === undefined && this.s === 0) {
    return true;  
  }
  return false;
};


module.exports = mongoose.model('Match', MatchSchema);
