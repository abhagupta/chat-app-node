
var socket = io();

$('#send-message-btn').click(function () {
    var msg = $('#message-box').val();
    if(msg.length>0){
        socket.emit('chat', msg);
        $('#messages').append($('<p>').text(msg));
        $('#message-box').val('');
        return false;
    }

});

socket.on('connect', function() {
    socket.emit('create', 'business');
    socket.emit('adduser');
});
socket.on('chat', function ( msg, username) {
    $('#messages').append('<b>' + username + ':</b> '+ msg + '<br>');
});


socket.on('addedUser', function (username, room) {
    $('#username').append($('<p>').text(  username + ' has connected to ' +  room));
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

socket.on('updateusers', function(usernames){
    // code for showing the current users.
});

socket.on('updatechat', function(data, username){
    $('#messages').append('<b>' + username + ':</b> '+ msg + '<br>');
})

function switchRoom(room){
    $('#roomname').append('<h1' + room + '</h1>');

    // empty the messages
    // pull messages for this chat room from database by calling an ajax call
    $.ajax(
        {url: "/retrieveMessagesForRoom?room="+room,
        dataType: 'json',
         success: function(result){
             $('#messages').empty();
             result.forEach(function(message){
                 $('#messages').append('<b>' + message.user + ':</b> '+ message.content + '<br>');
             })
         }
        }
     );

    socket.emit('switchRoom', room);
}


