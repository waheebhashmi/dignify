const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const path = require('path');
const passport = require('passport');
// Load User model
const User = require('../models/User');
const { forwardAuthenticated } = require('../config/auth');

// Login Page
router.get('/loginPage.html', forwardAuthenticated, (req, res) => res.sendFile(path.join(__dirname, '../views', 'loginPage.html')));

// Register Page
router.get('/registerPage.html', forwardAuthenticated, (req, res) => res.sendFile(path.join(__dirname, '../views', 'registerPage.html')));

// Register
router.post('/registerPage.html', (req, res) => {
  const { name1, username, phonenumber, email, password } = req.body;
  let errors = [];

  if (!name1 || !email || !username || !phonenumber || !password ) {
    errors.push({ msg: 'Please enter all fields' });
  }

 

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.sendFile(path.join(__dirname, '../views', 'registerPage.html'), {
      name1,
      username,
      phonenumber,
      email,
      password
      
    })
  } else {
    User.findOne({ username: username }).then(user => {
      if (user) {
        errors.push({ msg: 'Username already exists' });
        res.sendFile(path.join(__dirname, '../views', 'registerPage.html'), {
        
          name1,
          username,
          phonenumber,
          email,
          password
        });
      } else {
        const newUser = new User({
          name1,
          email,
          phonenumber,
          username,
          password
        });

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
                res.redirect('/users/loginPage.html');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});

// Login
router.post('/loginPage.html', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: path.join(__dirname, '../views', 'dignifyuse.html'),
    failureRedirect: '/users/loginPage.html',
    failureFlash: true
  })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/loginPage.html');
});

module.exports = router;
