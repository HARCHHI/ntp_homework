var express = require("express");
var session = require("express-session");
var bodyparser = require("body-parser");
var mongoose = require('mongoose');
var md5 = require('blueimp-md5');
var io = require('./chatroom');
var port = 3000;

var app = express();
var http = require('http').Server(app);

app.use(express.static( __dirname + '/assets'));
app.use(bodyparser());
app.use(session({secret : 'jshwk'}));

io.chatinit(http);

mongoose.connect('mongodb://homework:homeworkPWD@localhost:9527/IS_homework');

var UserSchema = new mongoose.Schema({
    user : {type :String , unique: true},
    pwd : String,
    lastLogin : Date,
    lastChange : Date
});

var loginList = {};
app.get('/',function(req,res){

});

app.get('/loginCheck',function(req,res){
    var rese = req.session;
    if(rese.login == null) rese.login = false;
    if(loginList[rese.userId] != rese.id) rese.login = false;
    res.send({"login" : rese.login,"user" : rese.userId});
});

app.get('/getUser',function(req,res){
    var Users = mongoose.model('user',UserSchema);
    Users.find(true,function(err,rs){
       res.send(rs) ;
    });
});

app.post('/login',function(req,res){
    var rese = req.session;
    var userId = req.body['user'];
    var userPwd = req.body['pwd'];
    var userlogin = mongoose.model('user',UserSchema);
    

        userlogin.findOne({user : userId},function(err,rs){
            var rsJ = {'pwd':''};
            if(rs != null) rsJ = JSON.parse(JSON.stringify(rs));
            if(rsJ.pwd != md5(userPwd)){
                res.status(500).end();
            }
            else{
                var logMess = {'mutilog':false,'lastLogin':null,'pwd':'',group : ''};
                rese.login = true;
                rese.userId = userId;
                
                if(userId == 'a' || userId == 'b') logMess.group = 'a';
                else logMess.group = 'b';
                
                logMess.lastLogin = rsJ.lastLogin;
                if( loginList[rsJ.user] != rese.id && loginList[rsJ.user]!=null) logMess.mutilog=true;
                loginList[rsJ.user] = rese.id;
                userlogin.update({_id:rsJ._id},{lastLogin: Date.now()},{upsert:true},function(err){});
                logMess.lastChange = rsJ.lastChange;
                
                
                res.status(200).send(logMess).end();
            }
        });
    //res.status(404).send({'resault' :false});
    //}
});

app.post('/register',function(req,res){
    var user = mongoose.model('user',UserSchema);
    var rese = req.session;
    var userId = req.body['user'];
    var userPwd = req.body['pwd'];
    userPwd = md5(userPwd);
    var userRegist = new user({
        'user' : userId,
        'pwd' : userPwd,
        'lastChange' : Date.now()
    });
    userRegist.save(function(err){
        if(err) res.status(500).end();
        else res.send({"register" : true});
    })
    
});

app.post('/logout',function(req,res){
    var rese = req.session;
    delete loginList[rese.userId];
    rese.login = false;
    rese.userId = null;
    res.send({'logout':true}).end();
});

app.post('/changePwd',function(req,res){
    var userId = req.body['user'];
    var Oldpwd = req.body['Oldpwd'];
    var Newpwd = req.body['Newpwd'];
    var ChangePwd = mongoose.model('user',UserSchema);
    ChangePwd.findOne({user : userId},function(err,rs){
        var rsJ = {};
        if(rs != null) rsJ = JSON.parse(JSON.stringify(rs));
        if(rsJ.pwd !=md5(Oldpwd))res.status(500).end();
        else{
            ChangePwd.update({_id:rsJ._id},{lastChange:Date.now(),pwd : md5(Newpwd)},{upsert : true},function(err){});
            res.status(200).send({'resault':true}).end();
        }
    });
});

http.listen(port);
console.log("working on " + port);
