var mongoose = require('mongoose'),
    loginList = require('./loginList').loginList,
    database = require('./mongoConfig'),
    md5 = require('blueimp-md5');


exports.login = function(req,res){
    var rese = req.session,
        userId = req.body['user'],
        userPwd = req.body['pwd'],
        userlogin = mongoose.model('user',database.UserSchema);
    

        userlogin.findOne({user : userId},function(err,rs){
            var rsJ = {'pwd':''};
            if(rs != null) rsJ = JSON.parse(JSON.stringify(rs));
            if(rsJ.pwd != md5(userPwd)){
                res.status(500).end();
            }
            else{
                var logMess = {'mutilog':false,'lastLogin':null,'pwd':'',group : 'a'};
                rese.login = true;
                rese.userId = userId;

                logMess.lastLogin = rsJ.lastLogin;
                if( loginList[rsJ.user] != rese.id && loginList[rsJ.user]!=null) logMess.mutilog=true;
                loginList[rsJ.user] = rese.id;
                userlogin.update({_id:rsJ._id},{lastLogin: Date.now()},{upsert:true},function(err){});
                logMess.lastChange = rsJ.lastChange;
                
                
                res.status(200).send(logMess).end();
            }
        });
};

exports.loginCheck = function(req,res){
    var rese = req.session;
    if(rese.login == null) rese.login = false;
    if(loginList[rese.userId] != rese.id) rese.login = false;
    res.send({
        "login" : rese.login,
        "user" : rese.userId,
        "groups" : 'a'
    });
};

exports.getUsers = function(req,res){
    var Users = mongoose.model('user',database.UserSchema);
    Users.find(true,function(err,rs){
       res.send(rs).end();
    });
};

exports.register = function(req,res){
    var user = mongoose.model('user',database.UserSchema),
        rese = req.session,
        userId = req.body['user'],
        userPwd = req.body['pwd'];
    userPwd = md5(userPwd);
    var userRegist = new user({
        'user' : userId,
        'pwd' : userPwd,
        'lastChange' : Date.now()
    });
    
    
    console.log(userPwd);
    userRegist.save(function(err){
        if(err) res.status(500).end();
        else res.send({"register" : true});
    })
    
};

exports.logout = function(req,res){
    var rese = req.session;
    delete loginList[rese.userId];
    rese.login = false;
    rese.userId = null;
    res.send({'logout':true}).end();
};

exports.changePwd = function(req,res){
    var userId = req.body['user'],
        Oldpwd = req.body['Oldpwd'],
        Newpwd = req.body['Newpwd'],
        ChangePwd = mongoose.model('user',database.UserSchema);
    ChangePwd.findOne({user : userId},function(err,rs){
        var rsJ = {};
        if(rs != null) rsJ = JSON.parse(JSON.stringify(rs));
        if(rsJ.pwd !=md5(Oldpwd))res.status(500).end();
        else{
            ChangePwd.update({_id:rsJ._id},{lastChange:Date.now(),pwd : md5(Newpwd)},{upsert : true},function(err){});
            res.status(200).send({'resault':true}).end();
        }
    });
};

exports.getInfo = function(req,res){
    var rese = req.session;
    
};