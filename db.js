// var express = require('express');
module.exports=(req,res,next)=>{
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://sample_user:admin@cluster0.kt5lv.mongodb.net/conative?retryWrites=true&w=majority";
var { ObjectID } = require('mongodb');
next();
// var serverurl = 'http://localhost:4000/';

// module.exports = url;
// module.exports = MongoClient;
// module.exports = db;
}