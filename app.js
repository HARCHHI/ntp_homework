var express = require("express"),
    session = require("express-session"),
    bodyparser = require("body-parser"),
    io = require('./chatroom'),
    database = require('./mongoConfig'),
    webSite = require('./webSite'),
    port = 3000;

var app = express(),
    http = require('http').Server(app);

app.use(express.static( __dirname + '/assets'));
app.use(bodyparser());
app.use(session({secret : 'jshwk'}));

io.chatinit(http);

app.get('/',function(req,res){});

app.get('/loginCheck',webSite.loginCheck);

app.get('/getUsers',webSite.getUsers);

app.post('/login',webSite.login);

app.post('/register',webSite.register);

app.post('/logout',webSite.logout);

app.post('/changePwd',webSite.changePwd);

app.post('getInfo',webSite.getInfo);

http.listen(port);
console.log("working on " + port);
