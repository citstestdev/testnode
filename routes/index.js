var express = require('express');
var router = express.Router();
// var jwt = require('jsonwebtoken');
// var checkLogin = require('../../middleware/check');
  
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017?ssl=true";
var { ObjectID } = require('mongodb');

router.get('/setting', async function(req, res, next) {
   // res.send("Fds");
    await MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("conative");

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


module.exports = router;
