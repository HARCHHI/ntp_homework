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
	    var name = "";
	    if(typeof roomName == "object") name = roomName.room;
	    else name = roomName;
	    console.log(name);
            socket.room = name;
            socket.join(name);
        });
        socket.on('disconnect', function(){
            socket.leave(socket.room);
        });
        socket.on('changeRoom',function(roomName){
            socket.leave(socket.room);
	    var name = "";
	    if(typeof roomName == "object") name = roomName.room;
	    else name = roomName;
	    console.log(name);
            socket.join(name);
            socket.room = name;
        });
    });

}
