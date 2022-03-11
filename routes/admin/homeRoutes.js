var express = require("express");
var router = express.Router();
var multer = require("multer");
const session = require("express-session");
var checkLogin = require("../../middleware/check");
var axios = require("axios");
const cors = require("cors");
const async = require("async");
router.options("*", cors());

const MongoClient = require("mongodb").MongoClient;
const url =
  "mongodb+srv://sample_user:admin@cluster0.kt5lv.mongodb.net/conative?retryWrites=true&w=majority";
const { ObjectID } = require("mongodb");
var imagec = "";
// router.use("/imgupload", express.static(__dirname + "/imgupload"));
router.use("/uploads", express.static(__dirname + "/uploads"));
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    var path = require("path");
    imagec = new Date().toISOString().replace(/:/g, "-") + file.originalname;
    cb(null, "uploads");
    // cb(null, path.join(__dirname, "../../imgupload"));
    // cb(null, path.join(__dirname, "../../confrontend/public/assets/imgupload"));
    // cb(
    //   null,
    //   path.join(
    //     "/home/user/CITS-SERVER/TRAINEEWORK/Shailendra_Tiwari/contest/assets/imgupload"
    //   )
    // );
  },
  filename: function (req, file, cb) {
    cb(null, imagec);
  },
});

var upload = multer({ storage: storage });

router.get("/", checkLogin, async function (req, res, next) {
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");

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
        msg: "",
      });

      setTimeout(function () {
        session.massage = "";
      }, 4000);
    });
  });
});

router.get("/home", checkLogin, function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");

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
        title: "home",
        headermenu: headermenu_dynamic,
        settingmenu: setting_dynamic,
        opt: result,
        pagedata: homepage,
        msg: session.massage,
      });
      setTimeout(function () {
        session.massage = "";
      }, 5000);
    });
  });
});

router.post(
  "/home",
  upload.single("userPhoto"),
  async function (req, res, next) {
    await MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db("conative");

      const file = req.file;
      // console.warn("fileee",file);

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
        description: req.body.description.trim(),
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

      // var myobj = {
      //   name: req.body.name.trim(),
      //   title: req.body.title.trim(),
      //   description: req.body.description.trim(),
      //   image: imagepath,
      // };

      // dbo.collection("homes").insertOne(myobj, function (err, res) {
      //   if (err) throw err;
      //   console.log("document review inserted");
      //   session.massage = "Home updated successfully";
      // });
    });

    return res.redirect("/home");
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
