const express = require('express');
const path = require('path');
var async = require("async");
var flash = require('req-flash');
var cookieParser = require('cookie-parser');
var flash = require('connect-flash');





const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const nodemailer = require('nodemailer');

var crypto = require("crypto");
const mongoose = require('mongoose');
const passport = require('passport');

const session = require('express-session');

const app = express();

app.use(cookieParser('secret'));
app.use(session({cookie: { maxAge: 60000 }}));
app.use(flash());
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


app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



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

app.get('/contactPage.html', function (req, res, next) {
res.sendFile(path.join(__dirname, '../views', 'contactPage.html'));
});

app.listen(process.env.PORT || 3300, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});