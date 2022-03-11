var express = require("express");
var router = express.Router();
var multer = require("multer");
var session = require("express-session");
var checkLogin = require("../../middleware/check");

const MongoClient = require("mongodb").MongoClient;
const url =
  "mongodb+srv://sample_user:admin@cluster0.kt5lv.mongodb.net/conative?retryWrites=true&w=majority";
const { ObjectID } = require("mongodb");

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

router.get("/industries", checkLogin, async function (req, res, next) {
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");

    var option = [];
    dbo.collection("option").findOne(function (err, result1) {
      option = result1;
    });

    var expertiseitem = [];
    dbo
      .collection("tbindustrieitem")
      .find()
      .sort({ _id: -1 })
      .toArray(function (err, result2) {
        expertiseitem = result2;
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

    dbo.collection("tbindustrie").findOne(function (err, result) {
      if (err) {
        return;
      }
      console.log(err);
      res.render("admin/home/Industries_show", {
        title: "Industries We Serve",
        opt: option,
        headermenu: headermenu_dynamic,
        settingmenu: setting_dynamic,
        pagedata: result,
        expertiseitem: expertiseitem,
        msg: session.message,
      });

      setTimeout(function () {
        session.message = "";
      }, 3000);
    });
  });
});

router.post("/industries", checkLogin, async function (req, res, next) {
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");
    dbo.collection("tbindustrie").deleteMany();
  });

  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");

    var myobj = {
      title: req.body.title.trim(),
      name: req.body.name.trim(),
      description: req.body.description.trim(),
    };

    dbo.collection("tbindustrie").insertOne(myobj, function (err, res) {
      if (err) throw err;
      console.log("document process inserted");
      // db.close();
    });
  });
  session.message = "Industries inserted successfully";
  return res.redirect("/industries");
});

router.post(
  "/industriesitem",
  upload.single("userPhoto"),
  async function (req, res, next) {
    await MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db("conative");

      const file = req.file;
      var imagepath = "";
      if (req.body.oldimage != "") {
        imagepath = req.body.oldimage.trim();
      }
      if (file && !file.length) {
        imagepath = file.path.trim();
      }

      var myobj = {
        name: req.body.name.trim(),
        image: imagepath.trim(),
      };

      dbo.collection("tbindustrieitem").insertOne(myobj, function (err, res) {
        if (err) throw err;
        console.log("document industrieitem inserted");
      });
    });
    session.message = "Industrie item inserted successfully";
    return res.redirect("/industries");
  }
);

router.get("/industriesitemremove/:id", async function (req, res, next) {
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");
    dbo.collection("tbindustrieitem").remove({ _id: ObjectID(req.params.id) });
  });
  session.message = "Industries item deleted successfully";
  res.redirect("/industries");
});

router.get("/getindustrieitem/:id", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");
    var aid = req.params.id;
    // var updatearr = [];
    dbo
      .collection("tbindustrieitem")
      .findOne({ _id: ObjectID(aid) }, function (err, result) {
        res.status(200).json(result);
      });
  });
});

router.post(
  "/industriesedit",
  upload.single("userPhoto"),
  async function (req, res, next) {
    await MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db("conative");

      const file = req.file;
      var imagepath = "";
      if (req.body.oldimage != "") {
        imagepath = req.body.oldimage.trim();
      }
      if (file && !file.length) {
        imagepath = file.path.trim();
      }

      var myobj = {
        $set: {
          name: req.body.name.trim(),
          image: imagepath,
        },
      };

      var collection = dbo.collection("tbindustrieitem");

      collection.updateOne(
        { _id: ObjectID(req.body.editid) },
        myobj,
        function (err, result) {
          if (err) {
            throw err;
          }
          session.message = "Industrie item updated successfully";
          res.redirect("/industries");
        }
      );
    });
  }
);

module.exports = router;
