//jshint esversion:8
const express = require('express'); /* this is used for the express module */
const mongoose = require('mongoose');/** this is the npm package for database */
const passport = require('passport');/** this module is for authentication */
const flash = require('connect-flash');/** this is used for a small flash for the current activity */
const session = require('express-session');/** this is used for the user account session */

const app = express();/** initializing the application */

// Passport Configuration for the register and logi authentication
require('./config/passport')(passport);

// DB Configuration for storing the data on online database (mongodb atlas) which is in another file called config
const db = require('./config/keys').mongoURI;

// Connect to MongoDB atlas to the application
mongoose
  .connect(
    db,
    { useNewUrlParser: true,useUnifiedTopology:true }
  )
  .then(() => console.log('MongoDB Connected')) /** if connected to the database this log will show in the console */
  .catch(err => console.log(err));/** if something is error then it will show the error */

// This is the template engine for the body 
app.set('view engine', 'ejs');

// Express body parser to parse the data on request from the body
app.use(express.urlencoded({ extended: true }));

// Express session for users
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

// Passport middleware this is for the passport initializing method 
app.use(passport.initialize());
app.use(passport.session());

// Connect flash to show the current activity or show the warning
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');/** this is a middleware function to call on request of success message */
  res.locals.error_msg = req.flash('error_msg');/** this is a middleware function to call on request of error message */
  res.locals.error = req.flash('error');/** this is a middleware function to call on request of error message */
  next();/** after go through all above function the request will send to the next function */
});

app.use('/', require('./routes/index.js')); /** This is the route for home page calling from a folder called routes */
app.use('/users', require('./routes/users.js')); /** This is the route for users page calling from a folder called routes */

const PORT = process.env.PORT || 5000; /** initializing the port for local host */

app.listen(PORT, console.log(`Server started on port ${PORT}`)); /** This log will show that this server has started on port*/

