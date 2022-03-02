var express = require("express");
var router = express.Router();
var session = require("express-session");
var checkLogin = require("../../middleware/check");

const MongoClient = require("mongodb").MongoClient;
const url =
  "mongodb+srv://sample_user:admin@cluster0.kt5lv.mongodb.net/conative?retryWrites=true&w=majority";
const { ObjectID } = require("mongodb");

router.get("/frontend-menu", checkLogin, async function (req, res, next) {
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");

    var menus = [];
    dbo
      .collection("menus")
      .find({ displaymenu: "f" })
      .sort({ _id: -1 })
      .toArray(function (err, result1) {
        menus = result1;
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
      res.render("admin/menu/frontend-menu", {
        title: "Frontend Menu",
        headermenu: headermenu_dynamic,
        settingmenu: setting_dynamic,
        opt: result,
        pagedata: menus,
        msg: session.message,
      });
      setTimeout(function () {
        session.massage = "";
      }, 3000);
    });
  });
});

router.post("/frontend-menu", checkLogin, async function (req, res, next) {
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");

    var myobj = {
      title: req.body.title.trim(),
      urlslug: req.body.urlslug.trim(),
      url: req.body.menurl.trim(),
      description: req.body.description.trim(),
      index: req.body.index.trim(),
      displaymenu: "f",
      parent_id: req.body.parentmenu.trim(),
    };

    // console.log("memmm", myobj);

    dbo.collection("menus").insertOne(myobj, function (err, res) {
      if (err) throw err;
      console.log("1 document menu inserted");
      session.message = "Menu Added Successfully";
    });
  });

  // session.message = ""
  return res.redirect("/frontend-menu");
});

router.get("/bothmenuremove/:id", checkLogin, async function (req, res, next) {
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");
    dbo.collection("menus").remove({ _id: ObjectID(req.params.id) });
  });
  // console.log("fdsf", req.originalUrl);
  session.message = "Menu deleted successfully";
  return res.redirect("/" + req.originalUrl);
});

router.get("/backend-menu", checkLogin, async function (req, res, next) {
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");

    var menus = [];
    dbo
      .collection("menus")
      .find({ displaymenu: "b" })
      .sort({ _id: -1 })
      .toArray(function (err, result1) {
        menus = result1;
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
      res.render("admin/menu/backend-menu", {
        title: "Backend Menu",
        headermenu: headermenu_dynamic,
        settingmenu: setting_dynamic,
        opt: result,
        pagedata: menus,
        msg: session.message,
      });
      setTimeout(function () {
        session.massage = "";
      }, 3000);
    });
  });
});

router.post("/backend-menu", checkLogin, async function (req, res, next) {
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");

    var myobj = {
      title: req.body.title.trim(),
      urlslug: req.body.urlslug.trim(),
      url: req.body.menurl.trim(),
      description: req.body.description.trim(),
      index: req.body.index.trim(),
      displaymenu: "b",
      parent_id: req.body.parentmenu.trim(),
    };

    // console.log("memmm", myobj);

    dbo.collection("menus").insertOne(myobj, function (err, res) {
      if (err) throw err;
      console.log("1 document menu inserted");
      session.message = "Menu Added Successfully";
    });
  });

  // session.message = ""
  return res.redirect("/backend-menu");
});

// router.get("/show-front-menu", function (req, res, _next) {
//   var fullUrl = req.protocol + "://" + req.get("host");

//   MongoClient.connect(url, function (err, db) {
//     if (err) throw err;
//     var dbo = db.db("conative");

//     dbo
//       .collection("menus")
//       .find({ $or: [{ displaymenu: "f" }, { displaymenu: "fb" }] })
//       .sort({ index: 1 })
//       .toArray(function (err, result) {
//         if (err) {
//           return;
//         }
//         console.log(err);
//         res.status(200).json(result);
//       });
//   });
// });

// router.get("/show-backend-menu", checkLogin, function (req, res, _next) {
//   var fullUrl = req.protocol + "://" + req.get("host");

//   MongoClient.connect(url, function (err, db) {
//     if (err) throw err;
//     var dbo = db.db("conative");

//     dbo
//       .collection("menus")
//       .find({ $or: [{ displaymenu: "b" }, { displaymenu: "fb" }] })
//       .sort({ index: 1 })
//       .toArray(function (err, result) {
//         if (err) {
//           return;
//         }
//         console.log(err);
//         res.status(200).json(result);
//       });
//   });
// });

module.exports = router;
