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
        Room.findOne({roomname: req.body.roomname}, function(err, room){
            if(err){
                return res.send('Error while creating room:', err);
            }

            if(room){
                res.send("Room " + req.body.roomname + " already exists. Please choose another room name." );
            } else {
                var room = new Room();
                room.roomname = req.body.roomname;
                room.createdBy= req.user.username;
                room.users = [req.user.username];
                room.save(function (err) {
                    if (err) {
                        throw err;
                    }
                    res.render('welcome', {
                        username: req.user.username,
                        currentRoom: req.body.roomname
                    });
                });
            }

        })
    });

    app.get('/retrieveChatRooms', function(req, res, next){
        Room.find({},function(err, rooms){
            if(err){
                res.send("Error thrown when retrieving rooms" + err);
            }
            if(!rooms){
                res.send("no rooms found");
            } else {
                res.send(rooms);
            }
        })
    });

    app.get('/retrievePeopleInChatRoom', function(req, res, next){
        Room.find({roomname: req.query.room}, function(err, data){
            if(err){
                console.log("error thrown when retrieving people in a room" + err);
            } else {
                res.send(data);
            }
        })
    })


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
        var user_room = req.query.room;
        User.findOne({username: req.user.username}, function(err, user){

            if (user.rooms.indexOf(user_room) < 0) {
                User.update({'_id': user._id}, {$push: {'rooms': user_room}}, function (err, numAffected, rawResponse) {
                    if (err) {
                        return res.send("User update room error: " + err);
                    }


                });
            }

        });
        Room.findOne({'roomname': user_room}, function(err, room){
            if(err){
                return res.send("Room name update error: " + err);
            }
            if(room){
                Room.update({'_id': room._id}, {$addToSet: {'users': req.user.username}}, function( err){
                    if (err) {
                        return res.send("Room user update room error: " + err);
                    }
                })
            }

        })

        Messages.find({"room": req.query.room}, function(err, data){
            res.setHeader('Content-Type', 'application/json');
            res.send( data);

        });

    });

    app.get('/retrieveUsersInChatRooms', function(req, res, next){
        Room.findOne({roomname: req.query.room}, function(err, data){
            if(err){
                return res.send("Error thrown while retrieving users for room",  err);
            }
            if(!data){
                res.send(data.users);
            }

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



