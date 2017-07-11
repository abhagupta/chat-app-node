
var socket = io();

$('#send-message-btn').click(function () {
    var msg = $('#message-box').val();
    socket.emit('chat', msg);
    $('#messages').append($('<p>').text(msg));
    $('#message-box').val('');
    return false;
});

socket.on('connect', function() {
    socket.emit('create', 'business');
    socket.emit('adduser');
});
socket.on('chat', function ( msg) {
    $('#messages').append($('<p>').text(  msg));
});


socket.on('updatechat', function (username, data) {
    $('#username').append($('<p>').text(  username + ' has connected'));
});

socket.on('updaterooms', function(rooms, current_room){
    $('#rooms').empty();
    $.each(rooms, function(key, value){
        if(value == current_room){
            $('#rooms').append('<div' + value + '</div>');
        }else {
            $('#rooms').append('<div><a href="#" onclick="switchRoom(\''+value+'\')">' + value + '</a></div>');
        }
        });
    });


function switchRoom(room){
    $('#roomname').append('<h1' + room + '</h1>')
    socket.emit('switchRoom', room);
}


