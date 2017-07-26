var express = require('express');
 var routes = require('./routes');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const passportSocketIo = require('passport.socketio');
var flash = require('connect-flash');
var mongo = require('mongodb').MongoClient;
var mongoose = require('mongoose');
var User = require('./models/user');
var Room = require('./models/room');
mongoose.connect(process.env.CUSTOMCONNSTR_MONGOLAB_URI, {
    useMongoClient: true

});


const sessionStore = new MongoStore({mongooseConnection: mongoose.connection});

var http = require('http');
var path = require('path');

var app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(flash());
//app.use(cookieParser());


app.use(session({
    key: 'express.sid',
    secret: 'chatApp',
    store: sessionStore,
    resave: false,
    saveUninitialized: true

}));
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.set('port', process.env.PORT || 8000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));



require('./routes')(app, passport);

var serve = http.createServer(app);
var io = require('socket.io')(serve);

serve.listen(app.get('port'), function(){
    console.log('Express server listening to port :' + app.get('port'));
});

io.use(passportSocketIo.authorize({
    key:   'express.sid',
    secret: 'chatApp',
    store: sessionStore,
    cookieParser: require('cookie-parser'),
    success: function(data, accept) {

        accept(null, true);
    },
    fail: function(data, message, error, accept)  {
        if (error) {
            console.log(`error : ${message}`);

            accept(new Error('Unauthorized'));
        } else {
            console.log(`ok: ${message}`);
            accept(new Error('Unauthorized'));
        }
    }
}))

// usernames which are currently connected to the chat
var usernames = {};

io.on('connection', function(socket){
    console.log('user', socket.request.user.username + ' has connected');

    mongo.connect(process.env.CUSTOMCONNSTR_MONGOLAB_URI, function(err, db){
        var collection = db.collection('chat_messages');
        var stream = collection.find({}).sort({"time": -1}).limit(10).stream();

        stream.on('data', function (chat) {
            socket.emit('chat', chat.content, chat.user);
        });

    });

    socket.on('switchRoom', function(newroom){
        console.log('new room', newroom);
        socket.room = newroom;
        socket.leave(socket.room);
        socket.join(newroom);
        socket.emit('addedUser', socket.request.user.username,  newroom);
        socket.broadcast.to(newroom).emit('addedUser',  socket.request.user.username, newroom);
        //send message to old room
        socket.broadcast.to(socket.room);
    });

    socket.on('disconnect', function () {
        console.log('user ' + socket.request.user.username +  ' disconnected from ',   socket.room);
        leaveRooms(socket.request.user.username, socket);
        socket.leave(socket.room);
        delete usernames[socket.request.user.username];
       socket.emit('updateusers', usernames);

    });

    socket.on('chat', function (msg) {
        mongo.connect(process.env.CUSTOMCONNSTR_MONGOLAB_URI, function(err, db){
            var collection = db.collection('chat_messages');
            var stream = collection.find().sort().limit(10).stream();

            collection.insert({'content': msg, 'user': socket.request.user.username, 'time': Date.now(), 'room': socket.room }, function(err, o){
                if(err) {
                    console.warn(err.message);
                } else {
                    console.log("chat message inserted into db " + msg +  " by user "  + socket.request.user.username + " in room " + socket.room );
                }
            });

        });
       // socket.broadcast.emit('chat',  msg);
        var username = socket.request.user.username;
        socket.broadcast.to(socket.room).emit('chat',  msg, username, Date.now(), socket.room );
    });

    socket.on('sendchat', function(data){
        socket.in(socket.room).emit('updatechat',  data, socket.request.user.username);
    });

});

function leaveRooms(user, socket){
    User.findOne({username: user}, function(err, data){
        if(err){
            console.warn(err.message);
        } else {
            User.update({username: user}, {$set: {rooms:[]}}, function(err, val){
                if(err){
                    console.warn(err.message);
                } else {
                    Room.update({roomname: socket.room}, {$pull: {users: user}}, function(err, val){
                        if(err){
                            console.warn(err.message);
                        } else {
                            console.log("User " + user + " removed from " + socket.room);
                        }
                    })
                }
            });

        }
    });
   socket.broadcast.emit('userleft',   user, socket.room);

}






