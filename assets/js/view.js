var ExtView = Backbone.View.extend({
    el : $('main.container'),
    initialize : function(){
        this.loginCheck();
    },
    loginCheck : function(){
        var self = this;
        this.State = new userState();
        this.State.fetch({
            success : function(model,res,opt){
                if(!model.get("login")){
                    workspace.logined = false ;
                    alert('not login yet');
                    workspace.navigate('/home/login',{ trigger : true });
                }
                else {
                    workspace.logined = true;
                    workspace.navbar.render();
                    self.render();
                    workspace.userName = res.user;
                    workspace.userGroup = res.groups;
                }
            }
        });
        
    },
    remove : function(){
        this.$el.empty();
        this.off().undelegateEvents().stopListening();
        return this;
    },
    render : function(){
        var self = this;
        $.get('./layouts/' + this.name +".html",function(res){
            self.$el.html( res );
        });
    }
});

var V_nav = Backbone.View.extend({
    el : $('.navblock'),
    name : 'nav',
    initialize : function(){
        this.render();
    },
    remove : function(){
        this.$el.empty();
        this.off().undelegateEvents().stopListening();
        return this;
    },
    render : function(){
        var self = this;
        $.get('./layouts/' + this.name +".html",function(res){
            self.$el.html( _.template(res) );
        });
    },
    events : {
        'click #logoutBtn' : 'logout'
    },
    logout : function(){
        $.ajax({
            data : '',
            url : '/logout',
            dataType : 'JSON',
            type : 'post',
            cache : 'false',
            timeout : 10000,
            success : function(res){
                workspace.logined = false;
                workspace.navbar.render();
                if(workspace.socket) workspace.socket.disconnect();
                workspace.navigate('/home/login',{ trigger : true });
            }
        });
        
    }
});

var V_home = ExtView.extend({
    name : 'home'
});

var V_userlist = ExtView.extend({
    name : 'userlist',
    initialize : function(){
        this.models = new userList_collection();
        this.loginCheck();
        var self = this;
        this.models.fetch({
            success : function(rs){
                self.models = rs;
                if(workspace.logined == true) self.render();
                //self.render();
            }
        });
        
        //console.log(workspace.logined);
        
    },
    render : function(){
        var self = this;
        $.get('./layouts/' + this.name +".html",function(res){
            var template = _.template(res);
            self.$el.html(template( {models : self.models.toJSON()}));
        })
    }
});

var V_login = ExtView.extend({
    name : 'login',
    initialize : function(){
        this.render();
        this.user = new loginInfo_model();
    },
    events : {
        'change #user' : 'setValue',
        'change #pwd' : 'setValue',
        'submit' : 'logOrReg'
    },
    setValue : function(event){
        this.user.set(event.target.id,event.target.value);
    },
    logOrReg : function(){
        this.user.save({},{
            success : function(res){
                if(res.attributes.mutilog == true)alert('multi login , auto logout another user');
                workspace.navbar.render();
                workspace.navigate('/',{ trigger : true });
            },
            error : function(model,err){
                alert('login fail');
            }
        });
    }
});

var V_register = V_login.extend({
    name : 'register',
    logOrReg : function(){
        this.user.urlRoot = '/register';
        this.user.save({},{
            success : function(model,res,opt){
                if(res.register){
                    alert('register success,plz login');
                    workspace.navigate('/home/login',{ trigger : true });
                }
            },
            error : function(model,err){
                alert('error : have another same user name');
            }
        });
    }
});

var V_changepwd = ExtView.extend({
    name : 'changepwd',
    initialize : function(){
        ExtView.prototype.loginCheck();
        this.render();
        this.user = new changePwd_moedl();
    },
    events : {
        'change #user'  : 'setValue',
        'change #Oldpwd'  : 'setValue',
        'change #Newpwd'  : 'setValue',
        'submit' : 'changePWD'
    },
    setValue : function(){
        this.user.set(event.target.id,event.target.value);
    },
    changePWD : function(){
        this.user.save({},{
            success : function(res) {
                alert('change success');
                workspace.navigate('/',{ trigger : true });
            },
            error : function(model,err){
                alert('change fail');
            }
        });
    }
});

var V_prjMan = ExtView.extend({
    name : 'prjMan',
    events : {
        'click #go' : 'encry'
    },
    encry : function(){
        var plain = $('#plaintext').val();
        var resault = "",data,pos;
        for(var i=0 ;i<plain.length;i++){
            pos = Math.floor(Math.random()*3);
            data = plain.charAt(i);
            resault += encrylib[data][pos] + " ";
        }
        $('#resault').text(resault);
    }
});

var V_chat = ExtView.extend({
    name : 'chat',
    initialize : function(){
        this.loginCheck();
        this.inited = false;
    },
    initChat : function(){
        workspace.socket = io();
        var self = this;
        workspace.socket.on('message',function(data){
            self.appendMes(data);
        });
        workspace.socket.emit('adduser',workspace.userGroup);
        this.messages = [];
    },
    render : function(){
        var self = this;
        $.get('./layouts/' + this.name +".html",function(res){
            self.$el.html( _.template(res) );
        });
    },
    events : {
        'submit' : 'sendMes'
    },
    sendMes : function(){
        if(!this.inited) {
            this.initChat();
            this.inited = true;
        }
        var textIn = $('#Ciphertext');
        if(textIn.val() !=""){
            var data = {
                group : workspace.userGroup,
                userName : workspace.userName,
                message : textIn.val()
            };
            textIn.val('');
            workspace.socket.emit('message',data);
            this.appendMes(data);
        }
    },
    appendMes : function(data){
        var messArea = $('#messArea');
        this.messages.push(data.userName + " : " + data.message + "<br/>");
        if(this.messages.length>100) this.messages.shift();
        messArea.empty();
        messArea.append(this.messages);
        messArea.scrollTop($('#messArea').get(0).scrollHeight);
    }
});

//underscore   _.find(array,function(obj){reutnr obj.id=='require'});