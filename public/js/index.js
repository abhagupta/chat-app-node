
var socket = io();



$('#send-message-btn').click(function () {
    var msg = $('#message-box').val();
    if(msg.length>0){
        socket.emit('chat', msg);
        $('#messages ul').append('<li class="left clearfix">' +
            '<span class="chat-img1 pull-left"><img src=""  class="img-circle">' +
            '</span>' +
            '<div class="chat-body1 clearfix">' +
            '<p>' + msg + '</p>' +
            '<div class="chat_time pull-right">' + moment().format("h:mm:ss a") + '</div>' +
            '</div>' +
         '</li>');
        $('#message-box').val('');
        return false;
    }

});

socket.on('connect', function() {
    socket.emit('create', 'business');
    socket.emit('adduser');
});


socket.on('chat', function ( msg, username, time, room) {

    $('#roomname').empty();
   if(!room){
       room = 'room1';
   }
    $('#roomname').append('<p>' + room + '</p>');
    $.ajax(
        {url: "/retrieveMessagesForRoom?room=" + room,
            dataType: 'json',
            success: function(result){
                $('#messages').empty();
                var list = $("#messages").append('<ul class="list-unstyled"></ul>').find('ul');

                result.forEach(function(message){
                    // $('#messages ul').append('<b>' + message.user + ':</b> '+ message.content + '<br>');
                    list.append('<li class="left clearfix"> <span class="chat-img pull-left"><img src=""  class="img-circle"></img></span>' +
                        '<div class="chat-body1 clearfix">' +
                        '<strong>' + message.user + '</strong>' +
                        '<p>' + message.content + '</p>' +
                        '<div class="chat_time pull-right">' + moment(message.time).format("dddd, MMMM Do YYYY, h:mm:ss a") + '</div>' +
                        '</div>' +
                        '</li>');
                })
            }
        }
    );
});


socket.on('addedUser', function (username, room) {
    $('#username').append($('<p>').text(  username + ' has connected to ' +  room));
});

socket.on('updaterooms', function(rooms, current_room){
    $('#rooms').empty();
    $.each(rooms, function(key, value){

            $('#rooms').append('<li class="left clearfix" <span class="chat-img pull-left">' +

                '</span><div class="chat-body clearfix">' +
                '<div class="header_sec"> <strong class="primary-font"><a href="#" onclick="switchRoom(\''+value+'\')">' + value + '</a></strong> <strong class="pull-right">'+
                '</div></li>');

        });
    });

socket.on('updateusers', function(usernames){
    // code for showing the current users.
});

socket.on('updatechat', function(data, username){
    $('#messages').append('<b>' + username + ':</b> '+ msg + '<br>');
})

function switchRoom(room){
    $('#roomname').empty();
    $('#roomname').append('<p>' + room + '</p>');

    // empty the messages
    // pull messages for this chat room from database by calling an ajax call
    $.ajax(
        {url: "/retrieveMessagesForRoom?room="+room,
        dataType: 'json',
         success: function(result){
             $('#messages').empty();
             var list = $("#messages").append('<ul class="list-unstyled"></ul>').find('ul');

             result.forEach(function(message){
                 // $('#messages ul').append('<b>' + message.user + ':</b> '+ message.content + '<br>');
                 list.append('<li class="left clearfix"> <span class="chat-img pull-left"><img src=""  class="img-circle"></img></span>' +
                     '<div class="chat-body1 clearfix">' +
                     '<strong>' + message.user + '</strong>' +
                     '<p>' + message.content + '</p>' +
                     '<div class="chat_time pull-right">' + moment(message.time).format("dddd, MMMM Do YYYY, h:mm:ss a") + '</div>' +
                     '</div>' +
                     '</li>');
             })
         }
        }
     );

    socket.emit('switchRoom', room);
}


