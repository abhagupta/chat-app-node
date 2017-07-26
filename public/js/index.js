
var socket = io();

$(document).keypress(function(e) {
    if (e.which == 13) {
        $('#send-message-btn').trigger('click');
    }
});

var defaultRoom = 'default';
$(document).ready(function(e){
    $.ajax({
        url: '/retrieveChatRooms',
        dataType: 'json',
        success: function(rooms){
            $('#rooms').empty();
            if(rooms.length > 0){
                defaultRoom = rooms[0].roomname;
            }

            $.each(rooms, function(key, value){

                $('#rooms').append('<li class="left clearfix" <span class="chat-img pull-left">' +

                    '</span><div class="chat-body clearfix">' +
                    '<div class="header_sec"> <strong class="primary-font"><a class="btn btn-info" role="button" href="#" onclick="switchRoom(\''+value.roomname+'\')">' + value.roomname + '</a></strong> <strong class="pull-right">'+
                    '</div></li>');

            });
        }
    }
    )


});




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
        $('#messages ul').scrollTop($('#messages')[0].scrollHeight);
        $('#message-box').val('');
        return false;
    }

});

socket.on('connect', function() {
    socket.emit('create', 'business');
    //socket.emit('adduser');
});


socket.on('chat', function ( msg, username, time, room) {

    $('#roomname').empty();
   if(!room){
       room = defaultRoom;
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
                });
                $.ajax({
                    url: '/retrieveUsersInChatRooms?room='+room,
                    dataType: 'json',
                    success: function(users){
                        $('#room_members').empty();
                        var users_list =  $('#room_members').append('<ul></ul>').find('ul');
                        users.forEach(function(user){
                            users_list.append('<li class="user_list">' + user + '</li>');
                        });
                    }
                });
            }
        }
    );
});


socket.on('addedUser', function (username, room) {
    $('#userjoined').empty();
    $('#userjoined').append($('<p>').text(  username + ' has connected to ' +  room));
    $.ajax({
        url: '/retrieveUsersInChatRooms?room='+room,
        dataType: 'json',
        success: function(users){
            $('#room_members').empty();
            var users_list =  $('#room_members').append('<ul></ul>').find('ul');
            users.forEach(function(user){
                users_list.append('<li class="user_list">' + user + '</li>');
            });
        }
    });
});

socket.on('userleft', function(username, room){
    if(!room) {
        $('#userjoined').empty();
        $('#userjoined').append($('<p>').text(username + ' left ' + room));

        $.ajax({
            url: '/retrieveUsersInChatRooms?room=' + room,
            dataType: 'json',
            success: function (users) {
                $('#room_members').empty();
                var users_list = $('#room_members').append('<ul></ul>').find('ul');
                users.forEach(function (user) {
                    users_list.append('<li class="user_list">' + user + '</li>');
                });
            }
        });
    }
});



socket.on('updateusers', function(usernames){
    // code for showing the current users.
    console.log("update users called");
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
             $.ajax({
                 url: '/retrieveUsersInChatRooms?room='+room,
                 dataType: 'json',
                 success: function(users){
                     $('#room_members').empty();
                     var users_list =  $('#room_members').append('<ul></ul>').find('ul');
                     users.forEach(function(user){
                         users_list.append('<li class="user_list">' + user + '</li>');
                     });
                 }
             });

             // socket.join(room);
         }
        }
     );





    socket.emit('switchRoom', room);
}


