var mongoose = require('mongoose');

var messageSchema = mongoose.Schema({
    content: String,
    user: String,
    time: Date,
    room: String

});

module.exports = mongoose.model('chat_messages', messageSchema);
