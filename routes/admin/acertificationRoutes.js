var express = require("express");
var router = express.Router();
var multer = require("multer");
var checkLogin = require("../../middleware/check");

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

router.get("/awradscertification", checkLogin, async function (req, res, next) {
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");

    var option = [];
    dbo.collection("option").findOne(function (err, result1) {
      option = result1;
    });

    var awradsitem = [];
    dbo
      .collection("tbawradsitem")
      .find()
      .sort({ _id: -1 })
      .toArray(function (err, result2) {
        awradsitem = result2;
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

    dbo.collection("tbawradscertification").findOne(function (err, result) {
      if (err) {
        return;
      }
      console.log(err);
      res.render("admin/home/Awrads_certification", {
        title: "Certification & Recognition",
        opt: option,
        headermenu: headermenu_dynamic,
        settingmenu: setting_dynamic,
        pagedata: result,
        expertiseitem: awradsitem,
        msg: "",
      });
    });
  });
});

router.post(
  "/awradscertification",
  checkLogin,
  async function (req, res, next) {
    await MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db("conative");
      dbo.collection("tbawradscertification").deleteMany();
    });

    await MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db("conative");

      var myobj = {
        title: req.body.title.trim(),
        name: req.body.name.trim(),
        description: req.body.description.trim(),
      };

      dbo
        .collection("tbawradscertification")
        .insertOne(myobj, function (err, res) {
          if (err) throw err;
          console.log("document expertise inserted");
          // db.close();
        });
    });

    return res.redirect("/awradscertification");
  }
);

router.post(
  "/awradsitemform",
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
        imagepath = file.path;
      }

      var myobj = {
        name: req.body.name.trim(),
        description: req.body.description.trim(),
        image: imagepath,
      };

      dbo.collection("tbawradsitem").insertOne(myobj, function (err, res) {
        if (err) throw err;
        console.log("document awradsitem inserted");
        // db.close();
      });
    });

    return res.redirect("/awradscertification");
  }
);

router.post(
  "/awradsitemupdate",
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
        imagepath = file.path;
      }

      var myobj = {
        $set: {
          name: req.body.name.trim(),
          description: req.body.description.trim(),
          image: imagepath,
        },
      };

      var collection = dbo.collection("tbawradsitem");

      collection.updateOne(
        { _id: ObjectID(req.body.editid) },
        myobj,
        function (err, result) {
          if (err) {
            throw err;
          }

          res.redirect("/awradscertification");
        }
      );
    });
  }
);

router.get("/awradsitemremove/:id", async function (req, res, next) {
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");
    dbo.collection("tbawradsitem").remove({ _id: ObjectID(req.params.id) });
  });
  res.redirect("/awradscertification");
});

router.get("/getawradsitem/:id", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");
    var aid = req.params.id;
    dbo
      .collection("tbawradsitem")
      .findOne({ _id: ObjectID(aid) }, function (err, result) {
        res.status(200).json(result);
      });
  });
});

module.exports = router;
