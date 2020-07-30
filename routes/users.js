const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const path = require('path');
var flash = require('req-flash');
var async = require("async");
const nodemailer = require('nodemailer');
var crypto = require("crypto");
const passport = require('passport');
// Load User model
const User = require(path.join(__dirname, '../models', 'user.js'));
const { forwardAuthenticated } = require('../config/auth');

// Login Page
router.get('/loginPage.html', forwardAuthenticated, (req, res) => res.sendFile(path.join(__dirname, '../views', 'loginPage.html')));

// Register Page
router.get('/registerPage.html', forwardAuthenticated, (req, res) => res.sendFile(path.join(__dirname, '../views', 'registerPage.html')));

// Register
router.post('/registerPage.html', (req, res) => {
  const { name1, username, phonenumber, date, time, email, password } = req.body;
  let errors = [];

  if (!name1 || !email || !username || !date || !time || !phonenumber || !password ) {
    errors.push({ msg: 'Please enter all fields' });
  }


  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.sendFile(path.join(__dirname, '../views', 'registerPage.html'), {
      name1,
      username,
      date,
      time,
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
          date,
          time,
          phonenumber,
          email,
          password
        });
      } else {
        const newUser = new User({
          name1,
          email,
          date,
          time,
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
    successRedirect: '/users/dignifyuseLogout.html',
    failureRedirect: '/users/loginPage.html',
    failureFlash: true
  })(req, res, next);
});

// Logout
router.get('/.html', function (req, res, next) {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.sendFile(path.join(__dirname, '../views', 'dignifyuse.html'));
});

  router.get("/:id", function(req, res) {
  User.findById(req.params.id, function(err, foundUser) {
    if(err) {
      req.flash("error", "Something went wrong.");
      return res.sendFile(path.join(__dirname, '../views', 'dignifyuse.html'));
    }
    User.find().where('id').equals(foundUser._id).exec(function(err, user) {
      if(err) {
        req.flash("error", "Something went wrong.");
        return res.sendFile(path.join(__dirname, '../views', 'dignifyuse.html'));
      }
  
     res.json(foundUser); 
   

    })
  });
});
 



router.post('/send', (req, res) => {
  const output = `
    <p>You have a new contact request</p>
    <h3>Contact Details</h3>
    <ul>  
      
      <li>Email: ${req.body.email}</li>
    
    </ul>
    <h3>Message</h3>
    <p>${req.body.message}</p>
  `;


  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
  auth: {
        user: '[user]', // generated ethereal user
        pass: '[password]'  // generated ethereal password
    }
  });

  // setup email data with unicode symbols
  let mailOptions = {
      from: '[email]', // sender address
      to: '[email]', // list of receivers
      subject: 'Dignify Contact Request', // Subject line
      text: 'hello', // plain text body
      html: output // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          return console.log(error);
      }
      console.log('Message sent: %s', info.messageId);   
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

      res.sendFile(path.join(__dirname, '../views', 'contactPage.html'), {msg:'Email has been sent'});
  });
  
});
router.post('/forgot.html', function(req, res, next) {
     async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.sendFile(path.join(__dirname, '../views', 'forgot.html'));;
        }

        User.resetPasswordToken = token;
        User.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: '[user]',
          pass: '[password]
          '
        }
      });
      var mailOptions = {
        to: req.body.email,
        from: '[user]',
        subject: 'Node.js Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/users/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('info', 'An e-mail has been sent to ' + User.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.sendFile(path.join(__dirname, '../views', 'forgot.html'));
 

//1 start
router.get('/reset/:token', function(req, res) {
  
     User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.sendFile(path.join(__dirname, '../views', 'reset.html'))
    }
    res.sendFile(path.join(__dirname, '../views', 'reset.html'), {token: req.params.token});
  });
});

router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.sendFile(path.join(__dirname, '../views', 'dignifyuse.html'));
        }
        if(req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function(err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          })
        } else {
            req.flash("error", "Passwords do not match.");
            return res.sendFile(path.join(__dirname, '../views', 'dignifyuse.html'));
        }
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: '[user]',
          pass: '[password'
        }
      });
      var mailOptions = {
        to: req.body.email,
        from: '[email]',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + User.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
  res.sendFile(path.join(__dirname, '../views', 'loginPage.html'))
  });
});
 });
});


router.get('/forgot.html', function (req, res) {
res.sendFile(path.join(__dirname, '../views', 'forgot.html'));
})


router.get('/dignifyuse.html', function (req, res, next) {
res.sendFile(path.join(__dirname, '../views', 'dignifyuse.html'));
});
router.get('/dignifyuseLogout.html', function (req, res, next) {
res.sendFile(path.join(__dirname, '../views', 'dignifyuseLogout.html'));
});
router.get('/dignifyuse2.html', function (req, res, next) {
res.sendFile(path.join(__dirname, '../views', 'dignifyuse2.html'));
});
// Expr
router.get('/mapee.html', function (req, res, next) {
res.sendFile(path.join(__dirname, '../views', 'mapee.html'));
});
router.get('/registerPage2.html', function (req, res, next) {
res.sendFile(path.join(__dirname, '../views', 'registerPage2Passenger.html'));
});

router.get('/geo.html', function (req, res, next) {
res.sendFile(path.join(__dirname, '../views', 'geo.html'));
});



router.get('/loginButtonPage.html', function (req, res, next) {
res.sendFile(path.join(__dirname, '../views', 'loginButtonPage.html'));
});



router.get('/registerButtonPage.html', function (req, res, next) {
res.sendFile(path.join(__dirname, '../views', 'registerButtonPage.html'));
});

router.get('/contactPage.html', function (req, res, next) {
res.sendFile(path.join(__dirname, '../views', 'contactPage.html'));
});


module.exports = router;
