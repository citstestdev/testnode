const session = require("express-session");
var express = require("express");
var router = express.Router();
var multer = require("multer");
var jwt = require("jsonwebtoken");
var checkLogin = require("../../middleware/check");
const async = require("async");
var { upload, url } = require("../constants");

var MongoClient = require("mongodb").MongoClient;
var { ObjectID } = require("mongodb");


router.get("/users", checkLogin, async function (req, res, next) {
    await MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db("conative");
  
      var headermenu_dynamic = [];
      dbo
        .collection("menus")
        .find({
          $and: [{ $or: [{ displaymenu: "b" }] }, { $or: [{ parent_id: "1" }] }],
        })
        .sort({ index: 1 })
        .toArray(function (err, result) {
          if (err) {
            return;
          }
          //   console.log(err);
          headermenu_dynamic = result;
        });
  
      var setting_dynamic = [];
      dbo
        .collection("menus")
        .find({
          $and: [{ $or: [{ displaymenu: "b" }] }, { $or: [{ parent_id: "2" }] }],
        })
        .sort({ index: 1 })
        .toArray(function (err, result) {
          if (err) {
            return;
          }
          //   console.log(err);
  
          setting_dynamic = result;
        });
  
      dbo.collection("option").findOne(function (err, result) {
        if (err) {
          return;
        }
        if (!result) {
          res.send("Data Not Found Please Check Collection");
          console.log(err);
        } else {
          res.render("admin/user/all_user", {
            title: "users",
            opt: result,
            headermenu: headermenu_dynamic,
            settingmenu: setting_dynamic,
            msg: session.massage,
          });
          setTimeout(function () {
            session.massage = "";
          }, 3000);
        }
      });
    });
  });


router.get("/register", checkLogin, async function (req, res, next) {
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");

    var headermenu_dynamic = [];
    dbo
      .collection("menus")
      .find({
        $and: [{ $or: [{ displaymenu: "b" }] }, { $or: [{ parent_id: "1" }] }],
      })
      .sort({ index: 1 })
      .toArray(function (err, result) {
        if (err) {
          return;
        }
        //   console.log(err);
        headermenu_dynamic = result;
      });

    var setting_dynamic = [];
    dbo
      .collection("menus")
      .find({
        $and: [{ $or: [{ displaymenu: "b" }] }, { $or: [{ parent_id: "2" }] }],
      })
      .sort({ index: 1 })
      .toArray(function (err, result) {
        if (err) {
          return;
        }
        //   console.log(err);

        setting_dynamic = result;
      });

    dbo.collection("option").findOne(function (err, result) {
      if (err) {
        return;
      }
      if (!result) {
        res.send("Data Not Found Please Check Collection");
        console.log(err);
      } else {
        res.render("admin/user/user_register", {
          title: "register",
          opt: result,
          headermenu: headermenu_dynamic,
          settingmenu: setting_dynamic,
          msg: session.massage,
        });
        setTimeout(function () {
          session.massage = "";
        }, 3000);
      }
    });
  });
});

router.post(
  "/addnewuser",
  upload.single("userPhoto"),
  async function (req, res, next) {
    var person = req.body;

    const file = req.file;
    await MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db("conative");

      var imagepath = "";
      if (req.body.oldimage != "") {
        imagepath = req.body.oldimage;
      }

      if (file && !file.length) {
        // Do something
        imagepath = file.filename;
      }

      var myobj = {
        name: req.body.name.trim(),
        email: req.body.email.trim(),
        address: req.body.address.trim(),
        phone: req.body.phone.trim(),
        image: imagepath,
        password: req.body.password.trim(),
      };

      dbo.collection("tbregister").insertOne(myobj, function (err, res) {
        if (err) throw err;
        console.log("document clientinfo inserted");
      });
    });
    session.message = "New user register successfully";
    return res.redirect("/register");
  }
);

module.exports = router;
