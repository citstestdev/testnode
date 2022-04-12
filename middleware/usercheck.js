// const session = require("express-session");
// var { upload, url } = require("./constants");
const url =
  "mongodb+srv://sample_user:admin@cluster0.kt5lv.mongodb.net/conative?retryWrites=true&w=majority";

const MongoClient = require("mongodb").MongoClient;
const { ObjectID } = require("mongodb");
module.exports = (uid) => {
     
    console.log("idssisi",uid);
    //  var ui = uid ;
    // var userlogin = [];
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("conative");
    
        dbo
          .collection("users")
          .findOne({ _id: ObjectID(uid) }, function (err, result) {
            // userlogin = result;
            // console.log("DSFDSFDSFDS",result);
            return result;
          });
        //   console.log("DSFDSFDSFDS",userlogin);
        //   return userlogin;
      });
    }

  