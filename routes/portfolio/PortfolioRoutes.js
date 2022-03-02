var express = require("express");
var router = express.Router();
var multer = require("multer");
var session = require("express-session");
var checkLogin = require("../../middleware/check");

// var dbObj = require('../../db');
// var MongoClient = dbObj.MongoClient;
// var url = dbObj.url;
// var ObjectID = dbObj.ObjectID;
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

router.get("/portfolio", checkLogin, async function (req, res, next) {
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");

    var aboutarr = [];
    dbo
      .collection("portfolios")
      .find()
      .toArray(function (err, result1) {
        aboutarr = result1;
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
      res.render("admin/portfolio/portfolio", {
        title: "Portfolio",
        headermenu: headermenu_dynamic,
        settingmenu: setting_dynamic,
        pagedata: aboutarr,
        opt: result,
        msg: session.message,
      });
      setTimeout(function () {
        session.massage = "";
      }, 4000);
    });
  });
});

router.get("/api/portfolio", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");

    dbo
      .collection("portfolios")
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

router.get("/portfolio/:id", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");

    dbo
      .collection("portfolioitem")
      .find({ pid: ObjectID(req.params.id) })
      .toArray(function (err, result) {
        if (err) {
          return;
        }
        console.log(err);
        res.status(200).json(result);
      });
  });
});

router.post(
  "/portfolio",
  upload.single("userPhoto"),
  async function (req, res, next) {
    const portfoliomodel = require("../../models/Portfoliomodel");

    const file = req.file;
    var imagepath = "";
    if (req.body.oldimage != "") {
      imagepath = req.body.oldimage;
    }
    if (file && !file.length) {
      imagepath = file.path;
    }

    var message = "";

    var myobj = new portfoliomodel({
      title: req.body.title.trim(),
      description: req.body.description.trim(),
      image: imagepath,
    });
    await myobj.save();

    session.message = "Portfolio added successfully";

    return res.redirect("/portfolio");
  }
);

router.get("/portfolioremove/:id", checkLogin, async function (req, res, next) {
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");
    dbo.collection("portfolios").remove({ _id: ObjectID(req.params.id) });
  });
  session.message = "Portfolio deleted successfully";
  return res.redirect("/portfolio");
});

router.get("/portfolioitem/:id", checkLogin, async function (req, res, next) {
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");
    var portfolioarr = [];
    dbo
      .collection("portfolios")
      .findOne({ _id: ObjectID(req.params.id) }, function (err, result1) {
        portfolioarr = result1;
      });

    var portfolioitemarr = [];
    dbo
      .collection("portfolioitem")
      .find({ pid: ObjectID(req.params.id) })
      .toArray(function (err, result) {
        portfolioitemarr = result;
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
      res.render("admin/portfolio/portfolio_item", {
        title: "Portfolio Item",
        headermenu: headermenu_dynamic,
        settingmenu: setting_dynamic,
        pagedata: portfolioarr,
        portfolioitem: portfolioitemarr,
        opt: result,
        msg: "",
      });
    });
  });
});

router.post(
  "/addportfolioitem",
  checkLogin,
  upload.array("userPhoto"),
  async function (req, res, next) {
    var fullUrl = req.protocol + "://" + req.get("host");
    const file = req.files;

    file.forEach((element) => {
      var pro = {
        pid: ObjectID(req.body.portfolioid),
        imagename: "uploads/" + element.filename.trim(),
        url: fullUrl + "/uploads/" + element.filename.trim(),
      };

      MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("conative");

        dbo.collection("portfolioitem").insertOne(pro, function (err, res) {
          if (err) throw err;
          console.log("image document inserted");
          // db.close();
        });
      });
    });
    session.message = "Portfolio item added successfully";
    return res.redirect("/portfolio");
  }
);

router.get(
  "/pitemremove/:pid/:id",
  checkLogin,
  async function (req, res, next) {
    await MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db("conative");
      dbo.collection("portfolioitem").remove({ _id: ObjectID(req.params.id) });
    });
    session.message = "Portfolio item deleted successfully";
    return res.redirect("/portfolioitem/" + req.params.pid);
  }
);

module.exports = router;
