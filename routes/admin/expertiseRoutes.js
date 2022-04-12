var express = require("express");
var router = express.Router();
const session = require("express-session");
var multer = require("multer");
var checkLogin = require("../../middleware/check");
var axios = require("axios");
const async = require("async");
var { upload, url } = require("../constants");

const MongoClient = require("mongodb").MongoClient;

const { ObjectID } = require("mongodb");

router.get("/expertise", checkLogin, async function (req, res, next) {
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");

    var userlogin = [];
    dbo
    .collection("users")
    .findOne({ _id: ObjectID(session.userid) }, function (err, result) {
      userlogin =  result;
    });


    var option = [];
    dbo.collection("option").findOne(function (err, result1) {
      option = result1;
    });

    var expertiseitem = [];
    dbo
      .collection("expertiseitem")
      .find()
      .sort({ _id: -1 })
      .toArray(function (err, result2) {
        expertiseitem = result2;
      });

    var expertiseitemlist = [];
    dbo
      .collection("expertiselist")
      .find()
      .sort({ _id: -1 })
      .toArray(function (err, result2) {
        expertiseitemlist = result2;
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
        // console.log(err);
        headermenu_dynamic = result;
      });

    var setting_dynamic = [];
    dbo
      .collection("menus")
      .find({
        $and: [{ $or: [{ displaymenu: "b" }] }, { $or: [{ parent_id: "2" }] }],
      })
      .sort({ index: 1 })
      .toArray(function (err, sresult) {
        if (err) {
          return;
        }

        setting_dynamic = sresult;
      });

    dbo.collection("expertise").findOne(function (err, result) {
      if (err) {
        return;
      }
      console.log(err);
      res.render("admin/home/expertise_show", {
        title: "Expertise",
        opt: option,
        headermenu: headermenu_dynamic,
        settingmenu: setting_dynamic,
        pagedata: result,
        expertiseitemlist: expertiseitemlist,
        expertiseitem: expertiseitem,
        updatearr: [],
        userlogin: userlogin,
        msg: session.massage,
      });
      setTimeout(function () {
        session.massage = "";
      }, 5000);
    });
  });
});

router.post("/expertise", checkLogin, async function (req, res, next) {
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");

    var myobj = {
      oid: "1",
      title: req.body.title.trim(),
      name: req.body.name.trim(),
      description: req.body.description.trim(),
    };

    dbo
      .collection("expertise")
      .findOneAndUpdate(
        { oid: "1" },
        { $set: myobj },
        { upsert: true, returnNewDocument: true },
        function (err, res) {
          session.massage = "Data updated successfully";
        }
      );

    // dbo.collection("expertise").insertOne(myobj, function (err, res) {
    //   if (err) throw err;
    //   console.log("document expertise inserted");
    // });
  });

  session.massage = "Expertise added successfully";

  return res.redirect("/expertise");
});

router.post(
  "/expertiseitem",
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
        name: req.body.name.trim(),
        description: req.body.description.trim(),
        image: imagepath,
      };

      dbo.collection("expertiseitem").insertOne(myobj, function (err, res) {
        if (err) throw err;
        console.log("document expertiseitem inserted");
      });
    });
    session.massage = "Expertise item added successfully";
    return res.redirect("/expertise");
  }
);

router.post(
  "/expertiseitemupdate/:id",
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
        $set: {
          name: req.body.name.trim(),
          description: req.body.description.trim(),
          image: imagepath,
        },
      };

      var collection = dbo.collection("expertiseitem");

      collection.updateOne(
        { _id: ObjectID(req.params.id) },
        myobj,
        function (err, result) {
          if (err) {
            throw err;
          }

          session.massage = "Expertise item updated successfully";
          res.redirect("/expertise");
        }
      );
    });
  }
);

router.get("/expertiseitemremove/:id", async function (req, res, next) {
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");
    dbo.collection("expertiseitem").remove({ _id: ObjectID(req.params.id) });
  });

  session.massage = "Expertise item deleted successfully";
  res.redirect("/expertise");
});

router.get("/expertise-show", async function (req, res, next) {
  var fullUrl = req.protocol + "://" + req.get("host");
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");
    dbo.collection("expertise").findOne(function (err, result) {
      if (err) {
        return;
      }
      console.log(err);
      res.status(200).json(result);
    });
  });
});

router.get("/expertiseitem-show", async function (req, res, next) {
  var fullUrl = req.protocol + "://" + req.get("host");
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");
    dbo
      .collection("expertiseitem")
      .find()
      .sort({ _id: -1 })
      .toArray(function (err, result) {
        if (err) {
          return;
        }
        console.log(err);
        res.status(200).json(result);
      });
  });
});

router.get("/expertiseitem-show-list", async function (req, res, next) {
  var fullUrl = req.protocol + "://" + req.get("host");
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");
    dbo
      .collection("expertiselist")
      .find()
      .sort({ _id: -1 })
      .toArray(function (err, result) {
        if (err) {
          return;
        }
        console.log(err);
        res.status(200).json(result);
      });
  });
});

router.get("/expertiseitem-show-limit", async function (req, res, next) {
  var fullUrl = req.protocol + "://" + req.get("host");
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");
    dbo
      .collection("expertiseitem")
      .find()
      .sort({ _id: -1 })
      .limit(6)
      .toArray(function (err, result) {
        if (err) {
          return;
        }
        console.log(err);
        res.status(200).json(result);
      });
  });
});

router.get("/singlepage/:id", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");
    var aid = req.params.id;

    dbo
      .collection("expertiseitem")
      .findOne({ _id: ObjectID(aid) }, function (err, result) {
        res.status(200).json(result);
      });
  });
});

router.get("/getexpertiseitem/:id", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");
    var aid = req.params.id;

    dbo
      .collection("expertiseitem")
      .findOne({ _id: ObjectID(aid) }, function (err, result) {
        res.status(200).json(result);
      });
  });
});

router.post(
  "/expertiseitemedit",
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
        $set: {
          name: req.body.name.trim(),
          description: req.body.description.trim(),
          image: imagepath,
        },
      };

      var collection = dbo.collection("expertiseitem");

      collection.updateOne(
        { _id: ObjectID(req.body.editid) },
        myobj,
        function (err, result) {
          if (err) {
            throw err;
          }

          session.massage = "Expertise item updated successfully";
          res.redirect("/expertise");
        }
      );
    });
  }
);

//
router.post("/expertiselistitem", async function (req, res, next) {
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");

    var myobj = {
      name: req.body.name,
    };

    dbo.collection("expertiselist").insertOne(myobj, function (err, res) {
      if (err) throw err;
      console.log("document expertiselist inserted");
    });
    session.massage = "Expertise list item added successfully";
    res.redirect("/expertise");
  });
});

router.get("/expertiselistremove/:id", async function (req, res, next) {
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");
    dbo.collection("expertiselist").remove({ _id: ObjectID(req.params.id) });
  });

  session.massage = "Expertise list item deleted successfully";
  res.redirect("/expertise");
});

module.exports = router;
