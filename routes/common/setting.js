const session = require("express-session");
var express = require("express");
var router = express.Router();
var multer = require("multer");
var jwt = require("jsonwebtoken");
var checkLogin = require("../../middleware/check");
const async = require("async");

var MongoClient = require("mongodb").MongoClient;
var url =
  "mongodb+srv://sample_user:admin@cluster0.kt5lv.mongodb.net/conative?retryWrites=true&w=majority";
var { ObjectID } = require("mongodb");

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

router.get("/setting", checkLogin, async function (req, res, next) {
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
        res.render("admin/home/setting", {
          title: "Setting",
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
  "/addsetting",
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
        imagepath = file.path;
      }

      var myobj = {
        oid: "1",
        name: req.body.clientname.trim(),
        email: req.body.clientemail.trim(),
        description: req.body.description.trim(),
        address: req.body.address.trim(),
        phone: req.body.phone.trim(),
        alternatephone: req.body.alternatephone.trim(),
        alternateemail: req.body.alternateemail.trim(),
        image: imagepath,
        footer: req.body.footer.trim(),
        header_analytics: req.body.header_analytics.trim(),
        footer_analytics: req.body.footer_analytics.trim(),
        query: req.body.query.trim(),
        button: req.body.button.trim(),
      };

      // console.log("dddddddd", myobj);

      dbo
        .collection("option")
        .findOneAndUpdate(
          { oid: "1" },
          { $set: myobj },
          { upsert: true, returnNewDocument: true },
          function (err, res) {
            session.massage = "Setting updated successfully";
          }
        );
    });

    return res.redirect("/setting");
  }
);

module.exports = router;
