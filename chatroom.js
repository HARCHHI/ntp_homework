exports.chatinit = function(http){
    var io = require('socket.io').listen(http);
    io.on('connection',function(socket){
        socket.on('message',function(data){
            socket.broadcast.to(data.group).emit('message',{
                userName : data.userName,
                message : data.message
            });
        });
        socket.on('adduser',function(roomName){
            socket.room = roomName;
            socket.join(roomName);
        });
        socket.on('disconnect', function(){
            socket.leave(socket.room);
        });
    });

}
