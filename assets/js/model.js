var userState = Backbone.Model.extend({
    urlRoot : '/loginCheck',
    idAttribute : '_id',
    defaults : {
        user : '',
        login : false
    }
});

var userInfo = Backbone.Model.extend({
    urlRoot : '/login',
    idAttribute : '_id',
    defaults : {
        user : '',
        pwd : ''
    }
})

var userList_model = Backbone.Model.extend({
    urlRoot : '/getUser',
    idAttribute : '_id',
    defaults : {
        user : '',
        pwd : '',
        lastLogin : ''
    }
})

var userList_collection = Backbone.Collection.extend({
   url : '/getUser' ,
    model : userList_model
});

var changePwd_moedl = Backbone.Model.extend({
    urlRoot : '/changePwd',
    idAttribute : '_id',
    defaults : {
        user : '',
        Newpwd : '',
        Oldpwd : ''
    }
});