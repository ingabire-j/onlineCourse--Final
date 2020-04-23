//jshint esversion:8
const express = require('express'); // initializing the express node module package
const router = express.Router(); // initializing the router 
const bcrypt = require('bcryptjs'); // this node module package isused for password encryption
const passport = require('passport'); // this is the password authentication 
router.use(express.static("public")); // set the middleware function to send the static files
// Load User model
const User = require('../models/User'); // calling the user schema model from model folder
const { forwardAuthenticated } = require('../config/auth'); // this is called for the module of forward authentication

// Login Page // this is the get route for user login. On request of user for login route the login page will be shown 
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Register Page // this is the get route for the user registration. On request of user for the register this page will be shown.
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

// Register // this is the post route for the user registration. On request of the registration user can fill up a form and post it to the database.
router.post('/register', (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  // if some field of form is empty then registration will be detained
  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please enter all fields' });
  }

  // if the password and confirm password is not the same then registration will be detained
  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  // this code is for password length.. if the password is less then 6 digits then the registration will be detained
  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  // if something is error then a flash containing some error log will come out on the registration page
  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2
    });
  } else {
    User.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: 'Email already exists' });
        res.render('register', {
          errors,
          name,
          email,
          password,
          password2
        });
      } else {
        const newUser = new User({
          name,
          email,
          password
        });

        // this is the password encryption method for the user password generating salt 
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );
                res.redirect('/dashboard');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});

// Login // in the login page when the user and password will be filled and the password is matched then the user dashboard will open
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

// Logout // this is the logout route if the user press the logout button then the get route will be triggered and the user will be logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

module.exports = router;
