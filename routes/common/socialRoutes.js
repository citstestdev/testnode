var express = require("express");
var router = express.Router();
var multer = require("multer");
var session = require("express-session");
var checkLogin = require("../../middleware/check");
var { upload, url } = require("../constants");

const MongoClient = require("mongodb").MongoClient;
// const url =
//   "mongodb+srv://sample_user:admin@cluster0.kt5lv.mongodb.net/conative?retryWrites=true&w=majority";
const { ObjectID } = require("mongodb");

// router.use("/uploads", express.static(__dirname + "/uploads"));
// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads");
//   },
//   filename: function (req, file, cb) {
//     cb(null, new Date().toISOString() + file.originalname);
//   },
// });

// var upload = multer({ storage: storage });

router.get("/social", checkLogin, async function (req, res, next) {
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");

    var option = [];
    dbo.collection("option").findOne(function (_err, result1) {
      option = result1;
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

    dbo
      .collection("socials")
      .find()
      .sort({ _id: -1 })
      .toArray(function (err, result1) {
        if (err) {
          return;
        }
        console.log(err);
        res.render("admin/home/socialmedia", {
          title: "Social Media",
          headermenu: headermenu_dynamic,
          settingmenu: setting_dynamic,
          opt: option,
          pagedata: result1,
          msg: session.message,
        });

        setTimeout(function () {
          session.message = "";
        }, 3000);
      });
  });
});

router.post(
  "/social",
  checkLogin,
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
        title: req.body.title.trim(),
        socialurl: req.body.socialurl.trim(),
        description: req.body.description.trim(),
        image: imagepath,
      };

      dbo.collection("socials").insertOne(myobj, function (err, res) {
        if (err) throw err;
        console.log("Document social inserted");
        session.message = "Social media inserted successfully";
      });
    });
    return res.redirect("/social");
  }
);

router.get("/social/:id", checkLogin, function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");

    var aid = req.params.id;

    var updatearr = [];
    dbo
      .collection("socials")
      .findOne({ _id: ObjectID(aid) }, function (err, result) {
        updatearr = result;
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
      res.render("admin/home/socialupdate", {
        title: "Social Edit",
        headermenu: headermenu_dynamic,
        settingmenu: setting_dynamic,
        opt: result,
        updatearr: updatearr,
        msg: "",
      });
    });
  });
});

router.get("/socialremove/:id", checkLogin, async function (req, res, next) {
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");
    dbo.collection("socials").remove({ _id: ObjectID(req.params.id) });
  });

  session.message = "Social media deleted successfully";

  return res.redirect("/social");
});

router.get("/getsocialitem/:id", async function (req, res, next) {
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");
    var aid = req.params.id;
    // var updatearr = [];
    dbo
      .collection("socials")
      .findOne({ _id: ObjectID(aid) }, function (err, result) {
        res.status(200).json(result);
      });
  });
});

router.post(
  "/socialedit",
  checkLogin,
  upload.single("userPhoto"),
  async function (req, res, next) {
    var person = req.body;
    const newObjectId = new ObjectID(person._id);

    const file = req.file;
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
        $set: {
          title: req.body.title.trim(),
          socialurl: req.body.socialurl.trim(),
          description: req.body.description.trim(),
          image: imagepath,
        },
      };

      var collection = dbo.collection("socials");

      collection.updateOne(
        { _id: ObjectID(req.body.editid) },
        myobj,
        function (err, result) {
          if (err) {
            throw err;
          }
        }
      );
    });

    session.message = "Social media updated successfully";

    return res.redirect("/social");
  }
);

module.exports = router;
