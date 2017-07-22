var Messages  = require('../models/messages');
var Room = require('../models/room');
var User = require('../models/user');

module.exports =  function (app, passport) {

    app.get('/', function(req, res, next){
        res.redirect('/login');
    });

    app.get('/signup', function(req, res, next){
        res.render('signup', { message: req.flash('signupMessage') });
    });

    app.post('/signup',  passport.authenticate('signup', {
        successRedirect : '/welcome', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    app.get('/login', function(req, res, next){
        res.render('login', { message: req.flash('loginMessage') });
    });

    app.post('/createRoom', function(req, res, next){
        var room = new Room();
        room.name = req.query.roomname;
        room.user= req.user.username;

    });


    app.post('/login', passport.authenticate('login', {
        successRedirect : '/welcome', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    app.get('/welcome', function(req, res, next){
        if(!req.session.passport){
            res.redirect('/unauthorised');
        } else {
            res.render('welcome', {
                username : req.user.username
            });
        }
    });
    app.get('/unauthorised', function(req, res, next){
             res.render('unauthorised');
        });

    app.get('/retrieveMessagesForRoom', function(req, res, next){

        User.findOne({username: req.user.username}, function(err, user){
            var user_room = req.query.room;
            if (user.rooms.indexOf(user_room) < 0) {
                User.update({'_id': user._id}, {$push: {'rooms': user_room}}, function (err, numAffected, rawResponse) {
                    if (err) {
                        return res.send("User update room error: " + err);
                    }
                    Room.findOne({'roomname': user_room}, function(err, room){
                        if(err){
                            return res.send("Room name update error: " + err);
                        }
                        Room.update({'_id': room._id}, {$push: {'users': req.user.username}})
                    })

                });
            }
        });

        Messages.find({"room": req.query.room}, function(err, data){
            res.setHeader('Content-Type', 'application/json');
            res.send( data);

        });

    });
    app.get('/logout', function(req, res){
        req.logout();
        req.session.destroy(function (err) {
            if (err) {
                return next(err);
            }

            // destroy session data
            req.session = null;

            // redirect to homepage
            res.redirect('/login');
        });

    })


}



