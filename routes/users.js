var express = require('express');
var router = express.Router();
var passport = require('passport');

var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/users');

/* GET users listing. */
router.get('/register', function(req, res, next) {
  res.render('signup');
});

router.get('/login', function(req, res, next){
  res.render('login')
});

router.get('/profile', ensureAuthenticated , function(req, res, next){
  res.render('profile', {user: req.user});
});

router.get('/matches', ensureAuthenticated, function(req,res,next){

  User.find({}, function(err, users){
    var matchesusers = [];
    for(var k = 0 ; k < req.user.units.length ; k++ ){
      for( var i = 0 ; i < users.length ; i++){
        for( var j = 0 ; j < users[i].units.length ; j++ ){
          if ( req.user.units[k] == users[i].units[j] && req.user.username !== users[i].username ){
              if ( users[i].username !== req.user.username ) {
                matchesusers.push(users[i]);
              }
          }
        }
      }
    }

    uniqArray = matchesusers.filter(function(item,pos,self){
      return self.indexOf(item) == pos;
    })
    res.render('matches', {matchlist: uniqArray, user:req.user});
  });
});

router.post('/register', function(req, res){

  var fname = req.body.fname;
  var lname = req.body.lname;
  var email = req.body.email;
  var phone = req.body.phone;
  var age = req.body.age;

  var username = req.body.uname;
  var password = req.body.password;
  var password2 = req.body.cpass;

  var units = [req.body.unit1, req.body.unit2, req.body.unit3, req.body.unit4];
  var avail = req.body.avail;
  var exp = req.body.exp;

  exp = JSON.stringify(exp) || null;
  avail = JSON.stringify(avail) || null;

  // console.log(fname + ' '+ email + ' ' + username + ' ' + password + ' ' + password2 + ' \nUnits Are:' + units);

  console.log('fname ' + fname + ' \n'
            + 'lname ' + lname + ' \n'
            + 'email ' + email + ' \n'
            + 'user ' + username + ' \n'
            + 'pass ' + password + ' \n'
            + 'exp ' + JSON.stringify(exp) + ' \n');

  req.checkBody('fname', 'First Name is Required').notEmpty();
  req.checkBody('lname', 'Last Name is Required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('uname', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('cpass', 'Password is not valid').equals(req.body.password);


  var errors = req.validationErrors();

  if ( errors ){
    res.render('signup', {errors:errors});
  } else {
    var newUser = new User({
      fname: fname,
      lname: lname,
      email: email,
      phone: phone,
      age: age,
      username: username,
      password: password,
      units: units,
      experience : exp,
      availability : avail
    });

    User.createUser(newUser, function(err, user){
      if (err) throw err;
      console.log(user);
    });

    res.redirect('/users/login');
  }
});

router.post('/register/update', ensureAuthenticated , function(req, res){

  var fname = req.body.fname;
  var lname = req.body.lname;
  var email = req.body.email;
  var numphone = req.body.phone;
  var age = req.body.age;
  var user = req.body.uname;

  var exp = req.body.exp;
  exp = JSON.stringify(exp);

  var units = [req.body.unit1, req.body.unit2, req.body.unit3, req.body.unit4];

  req.checkBody('fname', 'First Name is Required').notEmpty();
  req.checkBody('lname', 'Last Name is Required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();

  var errors = req.validationErrors();

  if ( errors ){
    res.render('profile', {errors:errors});
  } else {

    User.findOneAndUpdate( {username: user }, {
      fname: fname, lname: lname, email: email, phone: numphone,
      age: age, units: units, experience: exp
    }, function(err, user){
      if (err) throw err;
      console.log(user);
    });

    res.redirect('/users/profile');
  }
});
passport.use(new LocalStrategy(
  function(username, password, done){
    User.getUserByUsername( username, function(err,user){
      if(err) throw err;
      if (!user){
        return done(null, false, {message: 'Unknown User'});
      }

      User.comparePassword(password, user.password, function(err, isMatch){
        if(err) throw err;
        if(isMatch){
          return done(null, user);
        } else {
          return done (null, false, {message: "Unknown Password"});
        }
      });
    });
  }
));

passport.serializeUser(function(user, done){
  done(null,user.id);
});

passport.deserializeUser(function(id, done){
  User.getUserById(id, function(err,user){
    done(err,user);
  });
});

router.post('/login',
  passport.authenticate('local', {successRedirect:'/users/profile', failureRedirect:'/users/login'}),
  function (req, res){
    res.redirect('/');
  }
)

router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/users/login');
});

function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    res.redirect('/users/login');
  }
}

module.exports = router;
