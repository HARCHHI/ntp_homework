var mongoose = require('mongoose'),
    loginList = require('./loginList').loginList,
    database = require('./mongoConfig'),
    step = require('step');
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

                logMess.lastLogin = rs.lastLogin;
                if( loginList[rs.user] != rese.id && loginList[rs.user]!=null) logMess.mutilog=true;
                loginList[rs.user] = rese.id;
                userlogin.update({_id:rs._id},{lastLogin: Date.now()},{upsert:true},function(err){});
                logMess.lastChange = rs.lastChange;
                res.status(200).send(logMess).end();
            }
        });
};

exports.loginCheck = function(req,res){
    var rese = req.session;
    if(rese.login == null) rese.login = false;
    if(loginList[rese.userId] != rese.id) rese.login = false;
    var userModel = mongoose.model('user',database.UserSchema);
    
    step(
        function getUserGroups(err){
            if(rese.login) userModel.findOne({user:rese.userId},this);
            else {
                var rs = {groups : []};
                return rs;
            }
        },
        function sendData(err,rs){
            res.status(200).send({
                "login" : rese.login,
                "user" : rese.userId,
                "groups" : rs.groups
            });
        }
    );
    
};

exports.getUsers = function(req,res){
    var Users = mongoose.model('user',database.UserSchema);
    Users.find(true,function(err,rs){
        for(var user in rs){
            rs[user].pwd = "";
        }
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

exports.addGroup = function(req,res){
    var groupModel = mongoose.model('group',database.GroupSchema),
        userModel = mongoose.model('user',database.UserSchema),
        groupName = req.body['group'],
        groupMember = 0,
        rese = req.session;
    step(
        function findGroup(err){
            groupModel.findOne({'group' : groupName},this);
        },
        function addGroup(err,rs){
            if(rs === null) {
                var addGroup = new groupModel({
                    group : groupName,
                    member : 0
                });
                addGroup.save(this);
            }
            else {
                var rsJ = JSON.parse(JSON.stringify(rs));
                groupMember = rsJ.member;
                groupModel.update({group : groupName},{member : rsJ.member},{upsert : true},this);
            }
        },
        function updataUser(err){
            if(err) console.error(err.stack);
            else userModel.findOne({user:rese.userId},this);
        },
        function checkMultiGroups(err,rs){
            var rsJ = JSON.parse(JSON.stringify(rs));
            if(rsJ.groups.indexOf(groupName) == -1){
                userModel.update({user : rese.userId},{$push:{groups:groupName}},{upsert : true},this);
            }
            else res.status(200).send({'fail' : true});
            
        },
        function sendResult(err){
            if(err) console.error(err.stack);
            else {
                res.status(200).send({'group' : groupName , 'fail' : false}).end();
                groupModel.update({group : groupName},{member : groupMember+1},{upsert : true},this);
            }
        }
    );
};

exports.delGroup = function(req,res){
    var groupModel = mongoose.model('group',database.GroupSchema),
        userModel = mongoose.model('user',database.UserSchema),
        groupName = req.body['group'],
        rese = req.session;
    step(
        function getUser(err){
            userModel.findOne({user : rese.userId},this);
        },
        function delUserGroups(err,rs){
            var pos = -1;
            var data = rs.groups;
            
            pos = data.indexOf(groupName);
            data.splice(pos,1);
            if(pos != -1)
                userModel.update({user : rese.userId},{groups : data},{upsert : true},this);
        },
        function getGroupInfo(err){
            if(err) console.error(err.stack);
            groupModel.findOne({group : groupName},this);
        },
        function delGroup(err,rs){
            if(rs.member == 1)
                groupModel.remove({'group' : groupName},this);
            else
                groupModel.update({'group' : groupName},{'member' : rs.member -1},this);
        },
        function sendResult(err,rs){
            res.status(200).send({fail : false}).end();
        }
    );
    
};

exports.addPrj = function(req,res){
    var newPrj = req.body['newprj'],
        groupName = req.body['group'],
        groupModel = mongoose.model('group',database.GroupSchema),
        prjModel = mongoose.model('prj',database.PrjSchema);
    step(
        function getGroupInfo(err){
            groupModel.findOne({group : groupName},this);
        },
        function checkMultiPrj(err,rs){
            prjModel.findOne({masterId : groupName,name : newPrj},this);
        },
        function createPrj(err,rs){
            if(rs == null){
                var addPrj = new prjModel({
                    'masterId' : groupName,
                    'name' : newPrj,
                    'buildDate' : Date.now()
                });
                addPrj.save(this);
            }
            else res.status(200).send({fail : true}).end();
        },
        function addResult(err){
            if(err) console.error(err.stack);
            else res.status(200).send({fail : false}).end();
        }
    );
};

exports.getPrjs = function(req,res){
    var groupName = req.query.group;
    
    var prjs = mongoose.model('prj',database.PrjSchema);
    prjs.find({masterId : groupName},function(err,rs){
        res.status(200).send(rs).end();
    });
}

exports.addFea = function(req,res){
    var feaName = req.body['feaName'],
        feaDesc = req.body['feaDesc'],
        groupName = req.body['group'],
        prjName = req.body['name'],
        prjModel = mongoose.model('prj',database.PrjSchema);
    if(feaName !="" && feaDesc != "")
        prjModel.update({name : prjName , masterId : groupName},{$push:{feature : feaName,Desc : feaDesc}},{upsert : true},function(err){
            res.status(200).send({fail:false}).end();
        });
}

exports.delPrj = function(req,res){
    var groupName = req.body['masterId'],
        prjName = req.body['name'];
    var prjModel = mongoose.model('prj',database.PrjSchema);
    prjModel.remove({masterId : groupName , name : prjName},function(err){
        if(err)console.error(err.stack);
        else{
            res.status(200).send({fail : false}).end();
        }
    });
}

exports.delFea = function(req,res){
    var feaName = req.body['feaName'],
        feaDesc = req.body['feaDesc'],
        groupName = req.body['group'],
        prjName = req.body['name'],
        prjModel = mongoose.model('prj',database.PrjSchema);
    step(
        function getPrjData(err){
            prjModel.findOne({name : prjName,masterId : groupName},this);
        },
        function delFeature(err,rs){
            var test = rs;

            rs.Desc.splice(rs.Desc.indexOf(feaDesc),1);
            rs.feature.splice(rs.feature.indexOf(feaName),1);
            prjModel.update({name : prjName,masterId : groupName},rs,{upsert : true},this);
        },
        function sendSuccess(err){
            res.status(200).send({fail:false}).end();
        }
    );
    
}