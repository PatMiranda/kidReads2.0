// ==============================================================================
// DEPENDENCIES
// ==============================================================================

var passport = require("passport");

var mysql = require('mysql');

var bcrypt = require('bcrypt-nodejs');

// ==============================================================================
// PASSPORT-LOCAL SET-UP (CUSTOM LOGIN)
// ==============================================================================

// sets up strategy that can be found in passport.js documentation
var LocalStrategy = require('passport-local').Strategy;

// serialize user
passport.serializeUser(function(user, done){
    done(null, user.id);
});

// deserialize user
passport.deserializeUser(function(id, done){
    connection.query("SELECT * FROM users WHERE id = ? ",[id], function(err, rows){
        done(err, rows[0]);
    });
});

// LOGIN
passport.use(
    'local-login',
    new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true
    },
    function(req, username, password, done) { // callback with email and password from our form
        connection.query("SELECT * FROM users WHERE username = ?",[username], function(err, rows){
            if (err)
                return done(err);
            if (!rows.length) {
                return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
            }

            // if the user is found but the password is wrong
            if (!bcrypt.compareSync(password, rows[0].password))
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

            // all is well, return successful user
            return done(null, rows[0]);
        });
    })
);

// MAKE NEW USER
passport.use(
    'local-signup',
    new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) {
        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        connection.query("SELECT * FROM users WHERE username = ?",[username], function(err, rows) {
            if (err)
                return done(err);
            if (rows.length) {
                return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
            } else {
                // if there is no user with that username
                // create the user
                var newUserMysql = {
                    username: username,
                    password: bcrypt.hashSync(password, null, null)  // use the generateHash function in our user model
                };

                var insertQuery = "INSERT INTO users ( username, password ) values (?,?)";

                connection.query(insertQuery,[newUserMysql.username, newUserMysql.password],function(err, rows) {
                    newUserMysql.id = rows.insertId;

                    return done(null, newUserMysql);
                });
            }
        });
    })
);

// ==============================================================================
// GOOGLE OAUTH SET-UP
// ==============================================================================

// sets up strategy that can be found in passport.js documentation
var GoogleStrategy = require("passport-google-oauth20").Strategy;

// holds keys for page that is not committed or shared
var keys = require("./keys");

// imoorts the user model
var User = require("../models/user-model");

// serialize user
passport.serializeUser(function(user, done){
    done(null, user.id);
});

// deserialize user
passport.deserializeUser(function(id, done){
    User.findById(id).then(function(user){
        done(null, user);
    });
});

// passport syntax for setting up strategy
passport.use(
    new GoogleStrategy({
        // options for strategy
        clientID: keys.google.clientID,
        clientSecret: keys.google.clientSecret,
        callbackURL: "/auth/google/redirect"
    }, function(accessToken, refreshToken, profile, done) {
        // passport cb
        User.findOne({googleid: profile.id}).then(function(currentUser){
            if(currentUser){
                // user exists
                console.log("user logged in: " + currentUser)
                done(null, currentUser);
            }
                else {
                    // make new user
                    new User({
                        username: profile.displayName,
                        googleid: profile.id,
                        thumbnail: profile._json.image.url
                    }).save().then(function(newUser) {
                        console.log("new user created " + newUser)
                        done(null, newUser);
                    });
                }
        })
    })
);