var mongoose = require('mongoose');

var roomSchema = mongoose.Schema({
    roomname: String,
    createdBy: String,
    users: [String]

});

module.exports = mongoose.model('room', roomSchema);
