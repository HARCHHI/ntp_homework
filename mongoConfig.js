var mongoose = require('mongoose');

mongoose.connect('mongodb://homework:homeworkPWD@localhost:9527/IS_homework');

var UserSchema = new mongoose.Schema({
    user : {type :String , unique: true},
    pwd : String,
    lastLogin : Date,
    lastChange : Date
});

exports.UserSchema = new mongoose.Schema({
    user : {type :String , unique: true},
    pwd : String,
    lastLogin : Date,
    lastChange : Date
});