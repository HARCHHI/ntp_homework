var mongoose = require('mongoose');

mongoose.connect('mongodb://homework:homeworkPWD@localhost:9527/IS_homework');

exports.UserSchema = new mongoose.Schema({
    user : {type :String , unique: true},
    pwd : String,
    lastLogin : Date,
    lastChange : Date,
    groups : [String]
});

exports.GroupSchema = new mongoose.Schema({
    group : {type : String , unique : true},
    member : Number
});

exports.PrjSchema = new mongoose.Schema({
    masterId : String,
    name : String,
    buildDate : Date,
    feature : [String],
    Desc : [String]
});
