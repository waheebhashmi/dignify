const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');

const app = express();

// Passport Config
require('./config/passport')(passport);

// DB Config
const db = require('./config/keys').mongoURI;

// Connect to MongoDB
mongoose.connect('mongodb+srv://wave:ukzC3Ff9xTWdYLFL@cluster0-y2dty.mongodb.net/test?retryWrites=true&w=majority', {useNewUrlParser: true});
    mongoose.connection.once('open', function(){
      console.log('Conection has been made!');
    }).on('error', function(error){
        console.log('Error is: ', error);
    });



// Express body parser
app.use(express.urlencoded({ extended: true }));

// Express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Routes
app.use('/', require('./routes/index.js'));
app.use('/users', require('./routes/users.js'));

app.get('/', function (req, res, next) {
res.sendFile(path.join(__dirname, '../views', 'dignifyuse.html'));
});

app.get('/dignifyuse.html', function (req, res, next) {
res.sendFile(path.join(__dirname, '../views', 'dignifyuse.html'));
});


app.get('/registerPage2.html', function (req, res, next) {
res.sendFile(path.join(__dirname, '../views', 'registerPage2Passenger.html'));
});


app.get('/loginButtonPage.html', function (req, res, next) {
res.sendFile(path.join(__dirname, '../views', 'loginButtonPage.html'));
});



app.get('/registerButtonPage.html', function (req, res, next) {
res.sendFile(path.join(__dirname, '../views', 'registerButtonPage.html'));
});

router.get('/contactPage.html', function (req, res, next) {
res.sendFile(path.join(__dirname, '../views', 'contactPage.html'));
});

app.listen(process.env.PORT || 3300, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});