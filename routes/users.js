var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest: './uploads'});
var User = require('../models/User');
var LocalStrategy = require('passport-local').Strategy;
var passport = require('passport');


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


//get request for register page
router.get('/register', function(req, res, next) {
  res.render('register', { title: 'register' });
});


//post request for register page
router.post('/register', upload.single('profileimage'), function(req, res, next) {

  var name = req.body.name;
  var email = req.body.email;
  var password = req.body.password;
  var password2 = req.body.password2;
  var username = req.body.username;

  if(req.file){
    console.log('Uploading Image');
    var profileimage = req.file.filename;
  }
  else{
    console.log('No File Uploaded')
    //var profileimage = noimage.jpg;
  }

  req.checkBody('name', 'Name field is required').notEmpty();
  req.checkBody('name', 'Username field is required').notEmpty();
  req.checkBody('email', 'Email field is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('password', 'Password field is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(req.body.password2);

  var errors = req.validationErrors();

  if(errors){
    res.render('register', {
      errors: errors
    })
  }
  else{
    var newUser = new User({ //creating a document from the User model
      name: name,
      email: email,
      password: password,
      profileimage: profileimage,
      username: username
    });

    User.CreateUser(newUser, function(err, user){
      if(err) throw err;
      console.log(user);
    });

    req.flash('success', 'You are now registered and can Login');

    res.location('/');
    res.redirect('/');
  }

});



//get request for login page
router.get('/login', function(req, res, next) {
  res.render('login', { title: 'login' });
});



//post request for login page
router.post('/login', 
  passport.authenticate('local', { failureRedirect: '/users/login' }),
  function(req, res) {
    req.flash('success', 'You are now logged in');
    res.redirect('/');
  });

  passport.use(new LocalStrategy(function(username, password, done){
    User.getUserByUsername(username, function(err, user){
      if(err) throw err;
      if(!user){
        return done(null, false, {message: 'Unknown User'});
      }
  
      User.comparePassword(password, user.password, function(err, isMatch){
        if(err) return done(err);
        if(isMatch){
          return done(null, user);
        } else {
          return done(null, false, {message:'Invalid Password'});
        }
      });
    });
  }));

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.getUserById(id, function(err, user) {
      done(err, user);
    });
  });



  //logout request
  router.get('/logout', function(req, res){
    req.logout();
    req.flash('success', 'You are now logged out');
    res.redirect('/users/login')
  })






module.exports = router;
