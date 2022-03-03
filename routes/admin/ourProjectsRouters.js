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
  destination: function (_req, _file, cb) {
    cb(null, "uploads");
  },
  filename: function (_req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname);
  },
});

var upload = multer({ storage: storage });

router.get("/projects", checkLogin, async function (_req, res, next) {
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");

    var option = [];
    dbo.collection("option").findOne(function (_err, result1) {
      option = result1;
    });

    var expertiseitem = [];
    dbo
      .collection("ourprojectsitem")
      .find()
      .sort({ _id: -1 })
      .toArray(function (_err, result2) {
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

    dbo.collection("ourprojects").findOne(function (err, result) {
      if (err) {
        return;
      }
      console.log(err);
      res.render("admin/home/oProject_show", {
        title: "Our Projects",
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

router.post("/projects", checkLogin, async function (req, res, next) {
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");
    dbo.collection("ourprojects").deleteMany();
  });

  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");

    var myobj = {
      title: req.body.title.trim(),
      name: req.body.name.trim(),
      description: req.body.description.trim(),
    };

    dbo.collection("ourprojects").insertOne(myobj, function (err, _res) {
      if (err) throw err;
      console.log("document ourprojects inserted");
      // db.close();
    });
  });

  session.message = "Inserted data successfully";

  return res.redirect("/projects");
});

router.post(
  "/ourprojectsitem",
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
        description: req.body.description.trim(),
        image: imagepath,
      };

      dbo.collection("ourprojectsitem").insertOne(myobj, function (err, _res) {
        if (err) throw err;
        console.log("document ourprojectsitem inserted");
        // db.close();
      });
    });
    session.message = "Project item added successfully";
    return res.redirect("/projects");
  }
);

router.get("/ourprojectsitemremove/:id", async function (req, res, next) {
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");
    dbo.collection("ourprojectsitem").remove({ _id: ObjectID(req.params.id) });
  });
  session.message = "Project item deleted successfully";
  res.redirect("/projects");
});

router.get("/ourprojects-show", async function (req, res, _next) {
  var fullUrl = req.protocol + "://" + req.get("host");
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");
    dbo.collection("ourprojects").findOne(function (err, result) {
      if (err) {
        return;
      }
      console.log(err);
      res.status(200).json(result);
    });
  });
});

router.get("/ourprojectsitem-show", async function (req, res, _next) {
  var fullUrl = req.protocol + "://" + req.get("host");
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");
    dbo
      .collection("ourprojectsitem")
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

router.get("/ourprojectsitem-show-limit", async function (req, res, next) {
  var fullUrl = req.protocol + "://" + req.get("host");
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");
    dbo
      .collection("ourprojectsitem")
      .find()
      .sort({ _id: -1 })
      .limit(9)
      .toArray(function (err, result) {
        if (err) {
          return;
        }
        console.log(err);
        res.status(200).json(result);
      });
  });
});

router.get("/project/:id", function (req, res, _next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");
    var aid = req.params.id;
    dbo
      .collection("ourprojectsitem")
      .findOne({ _id: ObjectID(aid) }, function (_err, result) {
        res.status(200).json(result);
      });
  });
});

router.get("/getprojectitem/:id", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");
    var aid = req.params.id;
    // var updatearr = [];
    dbo
      .collection("ourprojectsitem")
      .findOne({ _id: ObjectID(aid) }, function (err, result) {
        res.status(200).json(result);
      });
  });
});

router.post(
  "/ourprojectsitemedit",
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
          description: req.body.description.trim(),
          image: imagepath,
        },
      };

      var collection = dbo.collection("ourprojectsitem");

      collection.updateOne(
        { _id: ObjectID(req.body.editid) },
        myobj,
        function (err, _result) {
          if (err) {
            throw err;
          }

          session.message = "Project item updated successfully";
          res.redirect("/projects");
        }
      );
    });
  }
);

module.exports = router;
