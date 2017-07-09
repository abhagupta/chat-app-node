var express = require('express');
 var routes = require('./routes');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('express-session');
var flash = require('connect-flash');
var mongo = require('mongodb').MongoClient;
var mongoose = require('mongoose');
// var user = require('./routes/user')
mongoose.connect(process.env.CUSTOMCONNSTR_MONGOLAB_URI);


var http = require('http');
var path = require('path');

var app = express();
app.use(bodyParser());
app.use(flash());


app.use(session({
    secret: 'chatApp',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}));
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.set('port', process.env.PORT || 8000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

app.use(checkAuth);


require('./routes')(app, passport);

var serve = http.createServer(app);
var io = require('socket.io')(serve);

serve.listen(app.get('port'), function(){
    console.log('Express server listening to port :' + app.get('port'));
});


io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('disconnect', function () {
        console.log('user disconnected');
    });
    socket.on('chat', function (msg) {

        mongo.connect(process.env.CUSTOMCONNSTR_MONGOLAB_URI, function(err, db){
            var collection = db.collection('chat_messages');
            var stream = collection.find().sort().limit(10).stream();
            stream.on('data', function (chat) { socket.emit('chat', chat.content); });
            collection.insert({'content': msg}, function(err, o){
                if(err) {
                    console.warn(err.message);
                } else {
                    console.log("chat message inserted into db " + msg);
                }
            });


        });
        socket.broadcast.emit('chat', msg);
    });
});


function checkAuth (req, res, next) {
    console.log('checkAuth ' + req.url);

    // don't serve /secure to those not logged in
    // you should add to this list, for each and every secure url
    if (req.url === '/secure' && (!req.session || !req.session.authenticated)) {

        res.render('unauthorized', { status: 403 });
        return;
    }

    next();
}



