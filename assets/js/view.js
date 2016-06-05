var ExtView = Backbone.View.extend({
    el : $('main.container'),
    initialize : function(){
        this.loginCheck(null);
    },
    loginCheck : function(callback){
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
                    workspace.userName = res.user;
                    self.render();
                    if(callback != null) callback();
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
            self.$el.html( _.template(res) );
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
        this.loginCheck(null);
        var self = this;
        this.models.fetch({
            success : function(rs){
                self.models = rs;
                if(workspace.logined == true) self.render();
            }
        });
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
        this.loginCheck();
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

var V_groMan = ExtView.extend({
    name : 'groMan',
    initialize : function(){
        this.loginCheck(null);
        this.model = new addGroup_model();
    },
    render : function(){
        var self = this;
        $.get('./layouts/' + this.name +".html",function(res){
            var template = _.template(res);
            self.$el.html(template(self.State.attributes));
        })
    },
    events : {
        'change #groupName' : 'setValue',
        'submit' : 'addGroup',
        'click button' : 'leaveGroup'
    },
    setValue : function(e){
        this.model.set("group",e.target.value.replace(/ /g,''));
    },
    addGroup : function(){
        var groupName = $('#groupName').val().replace(/ /g,'');
        $('#groupName').val(groupName);
        if(groupName == '') return;
        var self = this;
        this.model.save({},{
           success : function(model,rs) {
               if(rs.fail) alert("Join fail");
               else {
                   var result = self.State.get('groups');
                   result.push(model.get('group'));
                   self.State.set('groups',result);
                   self.render();
               }
           }
        });
    },
    leaveGroup : function(e){        
        if(e.target.id !='join'){
            var delGro = new addGroup_model(),
                delName = e.target.id,
                self = this;
            delGro.urlRoot = '/delGroup';
            delGro.set('group',delName);
            delGro.save({},{
               success : function(model,rs) {
                   var data = self.State.get('groups');
                   data.splice(data.indexOf(model.get('group')),1);
                   self.State.set('groups',data);
                   self.render();
               }
            });
        }
    }
});

var V_chat = ExtView.extend({
    name : 'chat',
    initialize : function(){
        var self = this;
        this.loginCheck(function(){
            if(self.State.get('groups').length != 0){
                workspace.socket = io();
                workspace.socket.on('message',function(data){
                    self.appendMes(data);
                });
                workspace.socket.emit('adduser',self.State.get('groups')[0]);
                self.messages = [];
                self.State.set('selectRoom',self.State.get('groups')[0]);
                self.render();
            }
            else{
                alert('not Join any Group yet');
                self.messages = [];
                self.State.set('selectRoom','noRoom');
                workspace.navigate('/home/groMan',{ trigger : true });
            }
        });
    },
    render : function(){
        var self = this;
        $.get('./layouts/' + this.name +".html",function(res){
            var template = _.template(res);
            self.$el.html(template(self.State.attributes));
        })
    },
    events : {
        'submit' : 'sendMes',
        'click' : 'changeRoom'
    },
    remove : function(){
        this.$el.empty();
        this.off().undelegateEvents().stopListening();
        workspace.socket.disconnect();
        return this;
    },
    sendMes : function(){
        var textIn = $('#Ciphertext');
        if(textIn.val() !=""){
            var data = {
                group : this.State.get('selectRoom'),
                userName : this.State.get('user'),
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
    },
    changeRoom : function(e){
        var room = e.target;
        if(room.id[0] == '_' && this.State.get('selectRoom') != $(room).text()) {
            room = $(room);
            this.State.set('selectRoom',room.text());
            if(workspace.socket != undefined)workspace.socket.emit('changeRoom',room.text());
            this.messages = [];
            this.render();
        }
        
    }
});

//underscore   _.find(array,function(obj){reutnr obj.id=='require'});