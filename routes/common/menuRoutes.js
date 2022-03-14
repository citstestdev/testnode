var express = require("express");
var router = express.Router();
var session = require("express-session");
var checkLogin = require("../../middleware/check");
var { upload, url } = require("../constants");

const MongoClient = require("mongodb").MongoClient;
// const url =
//   "mongodb+srv://sample_user:admin@cluster0.kt5lv.mongodb.net/conative?retryWrites=true&w=majority";
const { ObjectID } = require("mongodb");

router.get("/menu", checkLogin, async function (req, res, _next) {
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");

    var menus = [];
    dbo
      .collection("menus")
      .find()
      .sort({ _id: -1 })
      .toArray(function (err, result1) {
        menus = result1;
      });

    var headermenu_dynamic = [];
    dbo
      .collection("menus")
      .find({
        $and: [
          { $or: [{ displaymenu: "b" }, { displaymenu: "fb" }] },
          { $or: [{ parent_id: "1" }] },
        ],
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
        $and: [
          { $or: [{ displaymenu: "b" }, { displaymenu: "fb" }] },
          { $or: [{ parent_id: "2" }] },
        ],
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
      res.render("admin/home/menu", {
        title: "Menu",
        headermenu: headermenu_dynamic,
        settingmenu: setting_dynamic,
        opt: result,
        pagedata: menus,
        msg: session.message,
      });
      setTimeout(function () {
        session.massage = null;
        session.massage = "";
      }, 3000);
    });
  });
});

router.post("/menu", checkLogin, async function (req, res, _next) {
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");

    var myobj = {
      title: req.body.title.trim(),
      urlslug: req.body.urlslug.trim(),
      url: req.body.menurl.trim(),
      description: req.body.description.trim(),
      index: req.body.index.trim(),
      displaymenu: req.body.displaymenu.trim(),
      parent_id: req.body.parentmenu.trim(),
    };

    dbo.collection("menus").insertOne(myobj, function (err, res) {
      if (err) throw err;
      console.log("1 document menu inserted");
      session.message = "Menu Added Successfully";
    });
  });

  // session.message = ""

  return res.redirect("/menu");
});

router.get("/menuupdate/:id", checkLogin, function (req, res, _next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");
    var aid = req.params.id;

    var updatearr = [];
    dbo
      .collection("menus")
      .findOne({ _id: ObjectID(aid) }, function (err, result) {
        updatearr = result;
      });

    var headermenu_dynamic = [];
    dbo
      .collection("menus")
      .find({
        $and: [
          { $or: [{ displaymenu: "b" }, { displaymenu: "fb" }] },
          { $or: [{ parent_id: "1" }] },
        ],
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
        $and: [
          { $or: [{ displaymenu: "b" }, { displaymenu: "fb" }] },
          { $or: [{ parent_id: "2" }] },
        ],
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
      res.render("admin/home/menuupdate", {
        title: "Menu Edit",
        headermenu: headermenu_dynamic,
        settingmenu: setting_dynamic,
        opt: result,
        updatearr: updatearr,
        msg: "",
      });
    });
  });
});

router.post("/menu/:id", checkLogin, async function (req, res, _next) {
  var person = req.body;
  const newObjectId = new ObjectID(person._id);
  const file = req.file;
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");

    var myobj = {
      $set: {
        title: req.body.title.trim(),
        urlslug: req.body.urlslug.trim(),
        url: req.body.menurl.trim(),
        description: req.body.description.trim(),
        index: req.body.index.trim(),
        displaymenu: req.body.displaymenu.trim(),
        parent_id: req.body.parentmenu.trim(),
      },
    };

    var collection = dbo.collection("menus");

    collection.updateOne(
      { _id: ObjectID(req.params.id) },
      myobj,
      function (err, result) {
        if (err) {
          throw err;
        }
      }
    );
  });

  session.message = "Menu updateded successfully";

  return res.redirect("/menu");
});

router.get("/menuremove/:id", checkLogin, async function (req, res, _next) {
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");
    dbo.collection("menus").remove({ _id: ObjectID(req.params.id) });
  });

  session.message = "Menu deleted successfully";
  return res.redirect("/menu");
});

router.get("/show-front-menu", function (req, res, _next) {
  var fullUrl = req.protocol + "://" + req.get("host");

  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");

    dbo
      .collection("menus")
      .find({ $or: [{ displaymenu: "f" }, { displaymenu: "fb" }] })
      .sort({ index: 1 })
      .toArray(function (err, result) {
        if (err) {
          return;
        }
        console.log(err);
        res.status(200).json(result);
      });
  });
});

router.get("/show-backend-menu", checkLogin, function (req, res, _next) {
  var fullUrl = req.protocol + "://" + req.get("host");

  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");

    dbo
      .collection("menus")
      .find({ $or: [{ displaymenu: "b" }, { displaymenu: "fb" }] })
      .sort({ index: 1 })
      .toArray(function (err, result) {
        if (err) {
          return;
        }
        console.log(err);
        res.status(200).json(result);
      });
  });
});

module.exports = router;
