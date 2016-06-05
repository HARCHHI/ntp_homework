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
            if(socket.room != undefined)
                socket.leave(socket.room);
            socket.room = roomName;
            socket.join(roomName);
        });
        socket.on('disconnect', function(){
            socket.leave(socket.room);
        });
        socket.on('changeRoom',function(roomName){
            socket.leave(socket.room);
            socket.join(roomName);
            socket.room = roomName;
        });
    });

}
