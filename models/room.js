var mongoose = require('mongoose');

var roomSchema = mongoose.Schema({
    room: String,
    users: [String]

});

module.exports = mongoose.model('room', roomSchema);
