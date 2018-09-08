// ==============================================================================
// DEPENDENCIES
// ==============================================================================

var express = require("express");

var router = express.Router();

var passport = require("passport");

// ==============================================================================
// MIDDLEWARE FUNC
// ==============================================================================

// route middleware to make sure
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
};

// ==============================================================================
// ROUTES
// ==============================================================================

// HOME PAGE
router.get('/', function(req, res) {
    res.render('index');
});

//LOGIN
// show the login form
router.get('/login', function(req, res) {
    res.render('login');
});

// process the login form
router.post('/', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }),
    function(req, res) {
        console.log("hello");

        if (req.body.remember) {
            req.session.cookie.maxAge = 1000 * 60 * 3;
        } 
            else {
                req.session.cookie.expires = false;
            }
    res.redirect('/');
});

// SIGN UP PAGE
router.get('/signup', function(req, res) {
    res.render("signup");
});

// process the signup form
router.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/select', // redirect to the secure select section
    failureRedirect : '/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));

// PROFILE SELECT PAGE
// we will want this protected so you have to be logged in to visit
router.get('/select', isLoggedIn, function(req, res) {
    res.render('select', {
        user : req.user
    });
});

// LOGOUT
router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

module.exports = router;