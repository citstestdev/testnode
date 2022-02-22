const express = require('express')
const app = express()
var path = require('path');
const helmet = require("helmet")
const fs = require("fs")
const  ejs = require('ejs')
var expressLayout = require('express-ejs-layouts')
const mongoose = require('mongoose');
var bodyParser = require('body-parser')
const cors = require('cors')
var axios = require('axios')



var indexRouter = require('./routes/index');



app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(helmet());


// const urlencodedParser = bodyParser.urlencoded({ extended: false })
// app.use(bodyParser.json());



app.use(express.static('public'));
app.use(expressLayout);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


  
app.listen(process.env.PORT || 5000)

app.use('/', indexRouter);


app.get('/', function(req, res) {

  // res.send('Working!')
  res.send('wellcome conative!');
})

app.get('/hello', function(req, res) {

    // res.send('Working!')
    res.send('working!');
  })


var MongoClient = require('mongodb').MongoClient;
// var url = "mongodb://localhost:27017?ssl=true";

var url = "mongodb+srv://sample_user:admin@cluster0.kt5lv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

var { ObjectID } = require('mongodb');

app.get('/setting', async function(req, res, next) {
  // res.send("Fds");
   await MongoClient.connect(url, function(err, db) {
     if (err) throw err;
     var dbo = db.db("myFirstDatabase");

     var headermenu_dynamic = [];  
      dbo.collection('menus').find({$and: [{ $or:[ {'displaymenu':'b'},{'displaymenu':'fb'}]},{$or: [{"parent_id": "1"}]}]}).sort({'index':1}).toArray(function (err, result) {
         // console.log(result);
         if (err) {return};
         console.log(err);
          headermenu_dynamic = result;
       });

     var setting_dynamic = [];  
      dbo.collection('menus').find({$and: [{ $or:[ {'displaymenu':'b'},{'displaymenu':'fb'}]},{$or: [{"parent_id": "2"}]}]}).sort({'index':1}).toArray(function (err, result) {
         // console.log(result);
         if (err) {return};
         console.log(err);

          setting_dynamic = result;
     });

      dbo.collection('option').findOne(function (err, result) {
         // console.log(result);
         if (err) {return};
         if(!result){
          res.send("Page Not Found");
          console.log(err);
         }else{ 
          res.render('admin/home/setting', {title:'Setting', opt:result,headermenu:headermenu_dynamic,settingmenu:setting_dynamic,'msg':''});
        }
       });
   });
});

app.get('/home',  async function(req, res, next) {
  
  await MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("myFirstDatabase");
    
    var homepage = [];
     dbo.collection('homes').findOne(function (err, result) {
         homepage = result;
      });
      
    var headermenu_dynamic= [];  
     dbo.collection('menus').find({$and: [{ $or:[ {'displaymenu':'b'},{'displaymenu':'fb'}]},{$or: [{"parent_id": "1"}]}]}).sort({'index':1}).toArray(function (err, result) {
        // console.log(result);
        if (err) {return};
        console.log(err);

         headermenu_dynamic = result;
      });

    var setting_dynamic = [];  
     dbo.collection('menus').find({$and: [{ $or:[ {'displaymenu':'b'},{'displaymenu':'fb'}]},{$or: [{"parent_id": "2"}]}]}).sort({'index':1}).toArray(function (err, result) {
        // console.log(result);
        if (err) {return};
        console.log(err);

         setting_dynamic = result;
      });


     dbo.collection('option').findOne(function (err, result) {
        // console.log(result);
        if (err) {return};
        console.log(err);
  
           res.render('admin/home/home', { title:"home", headermenu:headermenu_dynamic, settingmenu:setting_dynamic,opt:result,pagedata:homepage, 'msg':''});
      });
  });

});






module.exports = app;