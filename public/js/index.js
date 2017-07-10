
var socket = io();

$('#send-message-btn').click(function () {
    var msg = $('#message-box').val();
    socket.emit('chat', msg);
    $('#messages').append($('<p>').text(msg));
    $('#message-box').val('');
    return false;
});

socket.on('connect', function() {
    socket.emit('adduser');
});
socket.on('chat', function ( msg) {
    $('#messages').append($('<p>').text(  msg));
});


socket.on('updatechat', function (username, data) {
    $('#username').append($('<p>').text(  username + ' has connected'));
});

