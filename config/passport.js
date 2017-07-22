var passport = require('passport');
var LocalStrategy   = require('passport-local').Strategy;

var User = require('../models/user');

module.exports = function(passport) {
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });
    passport.use('signup', new LocalStrategy({
            username : 'username',
            password : 'password',
            passReqToCallback : true
    },
        function(req, username, password, done) {
            process.nextTick(function() {
                User.findOne({username: username}, function (err, user) {
                    if (err) {
                        return done(err);
                    }

                    if (user) {
                        return done(null, false, req.flash('signupMessage', 'Username already taken'));
                    } else {

                        var newUser = new User();
                        newUser.username = username;
                        newUser.password = newUser.generateHash(password);
                        newUser.room = 'room1';
                        newUser.save(function (err) {
                            if (err) {
                                throw err;
                            }
                            return done(null, newUser);
                        });
                    }

                });
            });
        }
    ));

    passport.use('login', new LocalStrategy({
            username : 'username',
            password : 'password',
            passReqToCallback : true
        },
        function(req, username, password, done) {
            process.nextTick(function() {
                User.findOne({username: username}, function (err, user) {
                    if (err) {
                        return done(err);
                    }

                    if (!user)
                        return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

                    if (!user.validPassword(password))
                        return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

                    return done(null, user);
                });
            });
        }
    ));
}