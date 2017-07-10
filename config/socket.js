module.exports = function(config, io){
    io.on('connection', function(socket){
        console.log('a user connected', socket.request.user.username);
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

}