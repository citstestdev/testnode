var express = require("express");
var router = express.Router();
var multer = require("multer");
const session = require("express-session");
var checkLogin = require("../../middleware/check");
var { upload, url } = require("../constants");

const MongoClient = require("mongodb").MongoClient;
// const url =
// "mongodb+srv://sample_user:admin@cluster0.kt5lv.mongodb.net/conative?retryWrites=true&w=majority";
const { ObjectID } = require("mongodb");

router.get("/clientproject", checkLogin, async function (req, res, next) {
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");

    var option = [];
    dbo.collection("option").findOne(function (err, result1) {
      option = result1;
    });

    var expertiseitem = [];
    dbo
      .collection("tbclientinfo")
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

    dbo.collection("tbclientproject").findOne(function (err, cresult) {
      if (err) {
        return;
      }
      console.log(err);
      res.render("admin/home/ocProject_show", {
        title: "Client Project",
        opt: option,
        headermenu: headermenu_dynamic,
        settingmenu: setting_dynamic,
        pagedata: cresult,
        expertiseitem: expertiseitem,
        msg: session.message,
      });

      setTimeout(function () {
        session.message = "";
      }, 3000);
    });
  });
});

router.get("/clientform", checkLogin, function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");

    var expertise = [];
    dbo
      .collection("tbclientproject")
      .find()
      .toArray(function (err, result1) {
        expertise = result1;
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
      res.render("admin/home/ocProject", {
        title: "Client Project",
        headermenu: headermenu_dynamic,
        settingmenu: setting_dynamic,
        opt: result,
        pagedata: expertise,
        msg: "",
      });
    });
  });
});

router.post("/clientproject", checkLogin, async function (req, res, next) {
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");
    dbo.collection("tbclientproject").deleteMany();
  });

  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");

    var myobj = {
      title: req.body.title.trim(),
      name: req.body.name.trim(),
      description: req.body.description.trim(),
    };

    dbo.collection("tbclientproject").insertOne(myobj, function (err, res) {
      if (err) throw err;
      console.log("document process inserted");
    });
  });
  session.message = "Our client project inserted successfully";
  return res.redirect("/clientProject");
});

router.get("/clientprojectform", async function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
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
      res.render("admin/home/ocProject_item", {
        title: "Client Project Item",
        headermenu: headermenu_dynamic,
        settingmenu: setting_dynamic,
        opt: result,
        updatearr: [],
        msg: "",
      });
    });
  });
});

router.post(
  "/clientprojectitem",
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
        imagepath = file.filename.trim();
      }

      var myobj = {
        name: req.body.name.trim(),
        num: req.body.num.trim(),
        image: imagepath,
      };

      dbo.collection("tbclientinfo").insertOne(myobj, function (err, res) {
        if (err) throw err;
        console.log("document clientinfo inserted");
      });
    });
    session.message = "Our client project item inserted successfully";
    return res.redirect("/clientProject");
  }
);

router.get("/clientprojectedit/:id", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");
    var aid = req.params.id;

    var updatearr = [];
    dbo
      .collection("tbclientinfo")
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
      res.render("admin/home/ocProject_item", {
        title: "Client Project Item",
        headermenu: headermenu_dynamic,
        settingmenu: setting_dynamic,
        updatearr: updatearr,
        opt: result,
        msg: "",
      });
    });
  });
});

router.post(
  "/clientprojectupdate/:id",
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
        imagepath = file.filename.trim();
      }

      var myobj = {
        $set: {
          name: req.body.name.trim(),
          num: req.body.num.trim(),
          image: imagepath,
        },
      };

      var collection = dbo.collection("tbclientinfo");

      collection.updateOne(
        { _id: ObjectID(req.params.id) },
        myobj,
        function (err, result) {
          if (err) {
            throw err;
          }
          session.message = "Our client project item updated successfully";
          res.redirect("/clientProject");
        }
      );
    });
  }
);

router.get("/clientprojectremove/:id", async function (req, res, next) {
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");
    dbo.collection("tbclientinfo").remove({ _id: ObjectID(req.params.id) });
  });
  session.message = "Our client project deleted successfully";
  res.redirect("/clientProject");
});

router.get("/csliderform", async function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
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
      res.render("admin/home/ocsliderform", {
        title: "Client Slider",
        headermenu: headermenu_dynamic,
        settingmenu: setting_dynamic,
        opt: result,
        updatearr: [],
        msg: "",
      });
    });
  });
});

router.post(
  "/addslideritem",
  upload.single("clientPhoto"),
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
        imagepath = file.filename.trim();
      }

      var myobj = {
        name: req.body.name.trim(),
        author: req.body.author.trim(),
        videourl: req.body.videourl.trim(),
        description: req.body.description.trim(),
        image: imagepath,
      };

      dbo.collection("tbclientslider").insertOne(myobj, function (err, res) {
        if (err) throw err;
        console.log("document clientinfo inserted");
      });
    });
    session.message = "Our client slider inserted successfully";
    return res.redirect("/clientProject");
  }
);

router.get("/cp-show", async function (req, res, next) {
  var fullUrl = req.protocol + "://" + req.get("host");
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");
    dbo.collection("tbclientproject").findOne(function (err, result) {
      if (err) {
        return;
      }
      console.log(err);
      res.status(200).json(result);
    });
  });
});

router.get("/cpi-show", async function (req, res, next) {
  var fullUrl = req.protocol + "://" + req.get("host");
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");
    dbo
      .collection("tbclientinfo")
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

router.get("/cps-show", async function (req, res, next) {
  var fullUrl = req.protocol + "://" + req.get("host");
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");
    dbo
      .collection("tbclientslider")
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

// one page insert and update for =====================

router.get("/getclientprojectitem/:id", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");
    var aid = req.params.id;

    dbo
      .collection("tbclientinfo")
      .findOne({ _id: ObjectID(aid) }, function (err, result) {
        res.status(200).json(result);
      });
  });
});

router.post(
  "/clientprojecteditajax",
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
        imagepath = file.filename.trim();
      }

      var myobj = {
        $set: {
          name: req.body.name.trim(),
          num: req.body.num.trim(),
          image: imagepath,
        },
      };

      var collection = dbo.collection("tbclientinfo");

      collection.updateOne(
        { _id: ObjectID(req.body.editid) },
        myobj,
        function (err, result) {
          if (err) {
            throw err;
          }
          session.message = "Our client project item updated successfully";
          res.redirect("/clientProject");
        }
      );
    });
  }
);

router.get("/cp-show", async function (req, res, next) {
  var fullUrl = req.protocol + "://" + req.get("host");
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");
    dbo.collection("tbclientproject").findOne(function (err, result) {
      if (err) {
        return;
      }

      res.status(200).json(result);
    });
  });
});

router.get("/cpi-show", async function (req, res, next) {
  var fullUrl = req.protocol + "://" + req.get("host");
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");
    dbo
      .collection("tbclientinfo")
      .find()
      .toArray(function (err, result) {
        if (err) {
          return;
        }

        res.status(200).json(result);
      });
  });
});

router.get("/cps-show", async function (req, res, next) {
  var fullUrl = req.protocol + "://" + req.get("host");
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");
    dbo
      .collection("tbclientslider")
      .find()
      .toArray(function (err, result) {
        if (err) {
          return;
        }
        res.status(200).json(result);
      });
  });
});

module.exports = router;
