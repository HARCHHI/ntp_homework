var Router = Backbone.Router.extend({
    initialize : function(){
        if(!this.navbar) this.navbar = new V_nav();
    },
    routes : {
        "home/:action" : "actions",
        "*frag" : "defaultRoute"
    },
    actions : function(action){
        if(this.view) this.view.remove();
        this.view = new window["V_" + action];
    },
    defaultRoute : function(){
        if(this.view) this.view.remove();
        this.view = new V_home();
    }
});

$(function(){
    window.workspace = new Router();
    Backbone.history.start();
});