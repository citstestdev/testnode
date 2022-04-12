var express = require("express");
var router = express.Router();
var multer = require("multer");
const session = require("express-session");
var checkLogin = require("../../middleware/check");
var axios = require("axios");
const cors = require("cors");
var { upload, url } = require("../constants");
const async = require("async");
router.options("*", cors());

const MongoClient = require("mongodb").MongoClient;
const { ObjectID } = require("mongodb");

router.get("/", checkLogin, async function (req, res, next) {
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");

    var userlogin = [];
    dbo
    .collection("users")
    .findOne({ _id: ObjectID(session.userid) }, function (err, result) {
      userlogin =  result;
    });

    var option = [];
    dbo.collection("option").findOne(function (err, result) {
      option = result;
    });

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
        console.log(err);

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
        console.log(err);

        setting_dynamic = result;
      });

    dbo.collection("homes").findOne(function (err, result) {
      if (err) {
        return;
      }
      console.log(err);

      res.render("admin/home/home", {
        title: "home",
        headermenu: headermenu_dynamic,
        settingmenu: setting_dynamic,
        opt: option,
        pagedata: result,
        userlogin: userlogin,
        msg: "",
      });

      setTimeout(function () {
        session.massage = "";
      }, 4000);
    });
  });
});

router.get("/header", checkLogin, function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");

    var userlogin = [];
    dbo
    .collection("users")
    .findOne({ _id: ObjectID(session.userid) }, function (err, result) {
      userlogin =  result;
    });


    var homepage = [];
    dbo.collection("homes").findOne(function (err, result) {
      homepage = result;
    });

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
        console.log(err);
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
        console.log(err);

        setting_dynamic = result;
      });

    dbo.collection("option").findOne(function (err, result) {
      if (err) {
        return;
      }
      console.log(err);

      res.render("admin/home/home", {
        title: "header",
        headermenu: headermenu_dynamic,
        settingmenu: setting_dynamic,
        opt: result,
        pagedata: homepage,
        userlogin: userlogin,
        msg: session.massage,
      });
      setTimeout(function () {
        session.massage = "";
      }, 5000);
    });
  });
});

router.post(
  "/header",
  upload.single("userPhoto"),
  async function (req, res, next) {
    await MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db("conative");

      const file = req.file;

      var imagepath = "";
      if (req.body.oldimage != "") {
        imagepath = req.body.oldimage;
      }
      if (file && !file.length) {
        imagepath = file.filename;
      }

      var myobj = {
        hid: "1",
        name: req.body.name.trim(),
        title: req.body.title.trim(),
        backname: req.body.backname.trim(),
        btnproject: req.body.btnproject.trim(),
        btnteam: req.body.btnteam.trim(),
        image: imagepath,
      };

      dbo
        .collection("homes")
        .findOneAndUpdate(
          { hid: "1" },
          { $set: myobj },
          { upsert: true, returnNewDocument: true },
          function (err, res) {
            session.massage = "Home updated successfully";
          }
        );
    });

    return res.redirect("/header");
  }
);

router.get("/home-show", function (req, res, next) {
  var fullUrl = req.protocol + "://" + req.get("host");

  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");
    var reviewdata = [];
    dbo.collection("homes").findOne(function (err, result1) {
      reviewdata = result1;
      res.status(200).send(result1);
    });
  });
});

module.exports = router;
