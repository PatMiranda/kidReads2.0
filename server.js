// ==============================================================================
// DEPENDENCIES
// ==============================================================================

var passportSetup = require("./config/passport");

var keys = require("./config/keys");

var bodyParser = require("body-parser");

// ==============================================================================
// EXPRESS CONFIGURATION
// ==============================================================================

// Express dependency
var express = require("express");

// Tells node that we are creating an "express" server
var app = express();

// Sets an initial port. We"ll use this later in our listener
var PORT = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(bodyParser.json());

// =============================================================================
// FLASH MESSAGES (OPTIONAL)
// =============================================================================

var flash = require('connect-flash');

app.use(flash());

// =============================================================================
// COOKIES!!!!!!
// =============================================================================

var session  = require('express-session');

var passport = require('passport');

// required for passport
app.use(session({
	secret: 'thisappisalwaysrunning',
	resave: true,
	saveUninitialized: true
})); // session secret

app.use(passport.initialize());

app.use(passport.session()); // persistent login sessions

// =============================================================================
// HANDLEBARS
// =============================================================================

var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// =============================================================================
// ROUTES
// =============================================================================

// Import routes and give the server access to them.
var routes = require("./routes/routes.js");

app.use("/", routes);

// Home
app.get("/", function(req, res) {
    res.render("index");
});

// =============================================================================
// LISTENER
// =============================================================================

app.listen(PORT, function() {
    console.log("App listening on PORT: " + PORT);
  });