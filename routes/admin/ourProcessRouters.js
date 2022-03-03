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

router.get("/process", checkLogin, async function (req, res, next) {
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");

    var option = [];
    dbo.collection("option").findOne(function (err, result1) {
      option = result1;
    });

    var expertiseitem = [];
    dbo
      .collection("processplan")
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

    dbo.collection("process").findOne(function (err, result) {
      if (err) {
        return;
      }
      console.log(err);
      res.render("admin/home/oProcess_show", {
        title: "Our Process",
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

router.post("/process", checkLogin, async function (req, res, next) {
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");
    dbo.collection("process").deleteMany();
  });

  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");

    var myobj = {
      title: req.body.title.trim(),
      name: req.body.name.trim(),
      description: req.body.description.trim(),
    };

    dbo.collection("process").insertOne(myobj, function (err, res) {
      if (err) throw err;
      console.log("document process inserted");
      // db.close();
    });
  });
  session.message = "Our process inserted successfully";
  return res.redirect("/process");
});

router.post(
  "/processplan",
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
        image: imagepath,
      };

      dbo.collection("processplan").insertOne(myobj, function (err, res) {
        if (err) throw err;
        console.log("document processplan inserted");
      });
    });
    session.message = "Our process plan inserted successfully";
    return res.redirect("/process");
  }
);

router.get("/processplanremove/:id", async function (req, res, next) {
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");
    dbo.collection("processplan").remove({ _id: ObjectID(req.params.id) });
  });
  session.message = "Our process plan deleted successfully";
  res.redirect("/process");
});

router.get("/process-show", async function (req, res, next) {
  var fullUrl = req.protocol + "://" + req.get("host");
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");
    dbo.collection("process").findOne(function (err, result) {
      if (err) {
        return;
      }
      console.log(err);
      res.status(200).json(result);
    });
  });
});

router.get("/processplan-show", async function (req, res, next) {
  var fullUrl = req.protocol + "://" + req.get("host");
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");
    dbo
      .collection("processplan")
      .find()
      .toArray(function (err, result) {
        if (err) {
          return;
        }
        console.log(err);
        res.status(200).json(result);
      });
  });
});

router.get("/getprocessplan/:id", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");
    var aid = req.params.id;
    // var updatearr = [];
    dbo
      .collection("processplan")
      .findOne({ _id: ObjectID(aid) }, function (err, result) {
        res.status(200).json(result);
      });
  });
});

router.post(
  "/processplanedit",
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

      var collection = dbo.collection("processplan");

      collection.updateOne(
        { _id: ObjectID(req.body.editid) },
        myobj,
        function (err, result) {
          if (err) {
            throw err;
          }
          session.message = "Our process plan updated successfully";
          res.redirect("/process");
        }
      );
    });
  }
);

module.exports = router;
