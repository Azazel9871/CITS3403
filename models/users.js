var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var LocalStrategy = require('passport-local').Strategy;
var passport = require('passport');

var dbConfig = require('../db.js');
mongoose.connect(dbConfig.url);
var db = mongoose.connection;

var UserSchema = mongoose.Schema({
  username: {
    type: String,
    index: true
  },
  password: {
    type: String,
  },
  email: {
    type: String
  },
  fname: {
    type: String
  },
  lname: {
    type: String
  },
  age:{
    type: Number
  },
  phone:{
    type: String
  },
  email: {
    type: String
  },
  units: [String],
  experience: String
});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser = function( newUser, callback ){
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash( newUser.password , salt, function(err, hash) {
      newUser.password = hash;
      newUser.save(callback);
    });
  });
}

module.exports.getUserByUsername = function( username, callback ){
  var query = {username: username};
  User.findOne(query, callback);
}

module.exports.getUserById = function(id, callback ){
  User.findById(id, callback);
}

module.exports.comparePassword = function(cpassword, hash, callback){
  bcrypt.compare(cpassword, hash, function(err, isMatch){
    if(err) throw err;
    callback(null, isMatch);
  });
}
