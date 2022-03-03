var express = require("express");
var router = express.Router();
var multer = require("multer");
// var nodemailer = require('nodemailer');
var session = require("express-session");
var checkLogin = require("../../middleware/check");

var MongoClient = require("mongodb").MongoClient;
var url =
  "mongodb+srv://sample_user:admin@cluster0.kt5lv.mongodb.net/conative?retryWrites=true&w=majority";
var { ObjectID } = require("mongodb");

router.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept,Authorization"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET,PUT,PATCH,POST,DELETE,OPTIONS"
  );
  next();
});

router.use("/uploads", express.static(__dirname + "/uploads"));
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname);
  },
});

var upload = multer({ storage: storage });

router.get("/contact", checkLogin, async function (req, res, next) {
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");

    var option = [];
    dbo.collection("option").findOne(function (err, result1) {
      option = result1;
    });

    // var contactform = [];
    // dbo.collection("option").findOne(function (err, result1) {
    //   contactform = result1;
    // });
    // var showdata = [];
    // dbo
    //   .collection("contacts")
    //   .findOne(
    //     { _id: ObjectID("619e31a3d387bd16d03e874c") },
    //     function (err, result1) {
    //       showdata = result1;
    //     }
    //   );

    // var allcontactform = [];
    // dbo
    //   .collection("contacts")
    //   .find()
    //   .sort({ _id: -1 })
    //   .toArray(function (err, result) {
    //     allcontactform = result;
    //   });

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
      .toArray(function (err, result1) {
        if (err) {
          return;
        }
        // console.log(err);
        setting_dynamic = result1;
      });

    dbo
      .collection("contacts")
      .find()
      .sort({ _id: -1 })
      .toArray(function (err, result) {
        if (err) {
          return;
        }
        console.log(err);
        res.render("admin/contact/contact", {
          title: "Contact",
          headermenu: headermenu_dynamic,
          settingmenu: setting_dynamic,
          allcontactform: result,
          opt: option,
          // pagedata: showdata,
          msg: "",
        });

        setTimeout(function () {
          session.massage = "";
        }, 4000);
      });
  });
});

router.post("/contact", async function (req, res, next) {
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");

    var hell = [];
    arr = req.body.description.split(",");

    for (var i = 0; arr.length - 1 >= i; i++) {
      var d = arr[i].split(":");
      var k = d[0];
      var v = d[1];

      var input = {
        type: k,
        name: v,
      };
      hell.push(input);
    }

    var myobj = {
      formname: req.body.clientname.trim(),
      title: req.body.title.trim(),
      form: hell,
    };

    dbo.collection("contacts").insertOne(myobj, function (err, res) {
      if (err) throw err;
      console.log("document contact inserted");
    });
  });

  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");

    var contactform = [];
    dbo.collection("contacts").findOne(function (err, result1) {
      contactform = result1;
    });
    // var showdata = [];
    // dbo
    //   .collection("contacts")
    //   .findOne(
    //     { _id: ObjectID("619e31a3d387bd16d03e874c") },
    //     function (err, result1) {
    //       showdata = result1;
    //     }
    //   );

    var allcontactform = [];
    dbo
      .collection("contacts")
      .find()
      .sort({ _id: -1 })
      .toArray(function (err, result) {
        allcontactform = result;
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
      res.render("admin/contact/contact", {
        title: "Contact",
        headermenu: headermenu_dynamic,
        settingmenu: setting_dynamic,
        allcontactform: allcontactform,
        opt: result,
        // pagedata: showdata,
        msg: "Contact form added successfully",
      });

      setTimeout(function () {
        session.massage = "";
      }, 4000);
    });
  });

  // session.message = "Contact form added successfully";
  return res.redirect("/contact");
});

router.get("/contact-show", function (req, res, next) {
  var fullUrl = req.protocol + "://" + req.get("host");

  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");
    var showdata = [];
    dbo
      .collection("contacts")
      .findOne(
        { _id: ObjectID("619e31a3d387bd16d03e874c") },
        function (err, result1) {
          res.status(200).send(result1);
        }
      );
  });
});

router.post("/createContact", async function (req, res, next) {
  var fullUrl = req.protocol + "://" + req.get("host");

  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");
    var myobj = JSON.parse(req.body.body);

    dbo.collection("contactsPerson").insertOne(myobj, function (err, res) {
      if (err) throw err;
      console.log("document contactsPerson inserted");
    });
  });
});

module.exports = router;
