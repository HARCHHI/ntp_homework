var userState = Backbone.Model.extend({
    urlRoot : '/loginCheck',
    idAttribute : '_id',
    defaults : {
        user : '',
        login : false,
        groups : [],
        prjs : [],
        showPrj : ''
    }
});

var loginInfo_model = Backbone.Model.extend({
    urlRoot : '/login',
    idAttribute : '_id',
    defaults : {
        user : '',
        pwd : ''
    }
})

var userList_model = Backbone.Model.extend({
    urlRoot : '/getUsers',
    idAttribute : '_id',
    defaults : {
        user : '',
        pwd : '',
        lastLogin : ''
    }
})

var userList_collection = Backbone.Collection.extend({
   url : '/getUsers' ,
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

var addGroup_model = Backbone.Model.extend({
    urlRoot : '/addGroup',
    idAttribute : '_id',
    defaults : {
        group : ""
    }
});

var prj_model = Backbone.Model.extend({
    urlRoot : '/prjMethod',
    idAttribute : '_id',
    defaults : {
        group : "",
        prjs : [],
        newprj : ""
    }
});

var prj_collection = Backbone.Collection.extend({
    url : '/prjMethod',
    model : prj_model
});

var prjFea_model = Backbone.Model.extend({
    urlRoot : '/addFeature',
    idAttribute : '_id',
    defaults : {
        name : "",
        feaName : "",
        feaDesc : "",
        group : ""
    }
});

var delPrj_model = Backbone.Model.extend({
    urlRoot : '/delPrj',
    idAttribute : '_id',
    defaults : {
        name : "",
        masterId : ""
    }
});