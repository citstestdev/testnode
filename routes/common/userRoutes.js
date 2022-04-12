var createError = require("http-errors");
const session = require("express-session");
var express = require("express");
var router = express.Router();
var multer = require("multer");
var jwt = require("jsonwebtoken");
var checkLogin = require("../../middleware/check");
const async = require("async");
const bcrypt = require("bcrypt");
// var bodyParser = require("body-parser");
var { upload, url } = require("../constants");
const { check, validationResult } = require('express-validator');

var MongoClient = require("mongodb").MongoClient;
var { ObjectID } = require("mongodb");

const register = require("../../models/Registermodel");
// const urlencodedParser = bodyParser.urlencoded({ extended: false });
// router.use(bodyParser.json());


router.get("/users", checkLogin, async function (req, res, next) {
    await MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db("conative");


      // var userlogin = [];
      // dbo
      // .collection("users")
      // .findOne({ _id: ObjectID(session.userid) }, function (err, result) {
      //   userlogin =  result;
      // });
  
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
          //   console.log(err);
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
          //   console.log(err);
  
          setting_dynamic = result;
        });

        var getUser = [];
        dbo
          .collection("users")
          .find()
          .toArray(function (err, resultuser) {
            if (err) {
              return;
            }
            getUser = resultuser;

          });  

      var userlogin = [];
      dbo
      .collection("users")
      .findOne({ _id: ObjectID(session.userid) }, function (err, result) {
        userlogin =  result;
      });


      dbo.collection("option").findOne(function (err, result) {
        if (err) {
          return;
        }
        if (!result) {
          res.send("Data Not Found Please Check Collection");
          console.log(err);
        } else {
          res.render("admin/user/all_user", {
            title: "users",
            opt: result,
            userdata: getUser,
            headermenu: headermenu_dynamic,
            settingmenu: setting_dynamic,
            userlogin: [],
            successmsg: session.massage,
          });
          setTimeout(function () {
            session.massage = "";
          }, 3000);
        }
      });
    });
  });


router.get("/register", async function (req, res, next) {
  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");

    var userlogin = [];
    dbo
    .collection("users")
    .findOne({ _id: ObjectID(session.userid) }, function (err, result) {
      userlogin =  result;
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
        //   console.log(err);
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
        //   console.log(err);

        setting_dynamic = result;
      });

    dbo.collection("option").findOne(function (err, result) {
      if (err) {
        return;
      }
      if (!result) {
        res.send("Data Not Found Please Check Collection");
        console.log(err);
      } else {
        res.render("admin/user/user_register", {
          title: "register",
          opt: result,
          headermenu: headermenu_dynamic,
          settingmenu: setting_dynamic,
          userlogin: userlogin,
          successmsg: session.massage,
        });
        setTimeout(function () {
          session.massage = "";
        }, 3000);
      }
    });
  });
});


router.post('/addnewuser', upload.single("userPhoto"), [
  check("username", "Please enter username")
  .exists()
  .trim()
  .isLength({ min: 3 }),
  check("email", "Please enter email")
  .exists()
  .trim()
  .isEmail()
  .withMessage("Please enter valid email")
  .normalizeEmail()
  .custom((value, { req }) => {
    return new Promise((resolve, reject) => {
      register.findOne({ email: req.body.email }, function (err, user) {
        if (err) {
          console.log("ser");
          reject(new Error("Server Error"));
        }
        if (Boolean(user)) {
          reject(new Error("E-mail already in use"));
        }
        resolve(true);
      });
    });
  }),
  check("phone", "Please enter phone")
  .exists()
  .trim()
  .isLength({ min: 10, max: 10 }),
  check("address", "Please enter address")
  .exists()
  .trim()
  .isLength({ min: 5 }),
  check("userPhoto", "Please select image")
  .trim(),
  check("password", "Please enter password")
  .exists()
  .trim()
  .isLength({ min: 5 }),
   check("confirmPassword")
  .trim()
  .isLength({ min: 5 })
  .withMessage("Password must be minlength 5 characters")
  .custom(async (confirmPassword, { req }) => {
    const password = req.body.password;
    if (password !== confirmPassword) {
      throw new Error("Password must be same");
    }
  }),
  ],  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const alert = errors.array();
      // console.log(alert);
      res.render("admin/user/user_register", {
        alert,title: "register",
        opt: [],
        headermenu: [],
        settingmenu: [],
        userlogin: [],
        successmsg: "",
      });
    } else {
      const salt = await bcrypt.genSalt(10);
      // console.log("nooo");
      const hashpassword = await bcrypt.hash(req.body.password, salt);
      
      const file = req.file;

      var imagepath = "";
      if (req.body.oldimage != "") {
        imagepath = req.body.oldimage;
      }
      if (file && !file.length) {
        imagepath = file.filename;
      }


      var myobj = new register({
        username: req.body.username.trim(),
        email: req.body.email.trim(),
        phone: req.body.phone.trim(),
        address: req.body.address.trim(),
        password: hashpassword.trim(),
        userPhoto: imagepath,
      });
      myobj.save();
      session.massage = "User register successfully";
      return res.redirect("/register");
    }
  }
 );


//  usereditform

router.post('/usereditform', upload.single("userPhoto"), [
  check("username", "Please enter username")
  .exists()
  .trim()
  .isLength({ min: 3 }),
  check("phone", "Please enter phone")
  .exists()
  .trim()
  .isLength({ min: 10, max: 10 }),
  check("address", "Please enter address")
  .exists()
  .trim()
  .isLength({ min: 5 }),
  ],  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const alert = errors.array();
      // console.log(alert);
      res.render("admin/user/all_user", {
        alert,title: "users",
        opt: [],
        userdata: [],
        headermenu: [],
        settingmenu: [],
        userlogin:[],
        successmsg: "",
      });
    } else {

      await MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("conative");


      // dbo.collection("users").find(function (err, result) {
        dbo
        .collection("users")
        .findOne({ _id: ObjectID(req.body.editid) }, function (err, result) {
        if (err) {
          return;
        }
        if (result) {
          // console.log("userdata",result);
          if(result.email == req.body.email.trim()){

            const file = req.file;
            var imagepath = "";
              // console.log("hhd",result.email);
               if (req.body.oldimage != "") {
                  imagepath = req.body.oldimage;
                }
                if (file && !file.length) {
                  imagepath = file.filename;
                }

                var myobj = {
                  $set: {
                    username: req.body.username.trim(),
                    email: req.body.email.trim(),
                    phone: req.body.phone.trim(),
                    address: req.body.address.trim(),
                    userPhoto: imagepath,
                    updateAt: new Date(),
                  },
                };

                var collection = dbo.collection("users");

                collection.updateOne(
                  { _id: ObjectID(req.body.editid) },
                  myobj,
                  function (err, result) {
                    if (err) {
                      throw err;
                    }

                    session.massage = "User updated successfully";
                    res.redirect("/users");
                  }
                );
          }

        }
      });

      });
      
    }
  }
 );

router.get("/getuserbyid/:id", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");
    var aid = req.params.id;

    dbo
      .collection("users")
      .findOne({ _id: ObjectID(aid) }, function (err, result) {
        res.status(200).json(result);
      });
  });
});

router.get("/changepassword", function (req, res, next) {
  res.render("admin/user/forgotpassword", {title: "Forgot",
    opt: [],
    headermenu: [],
    settingmenu: [],
    userlogin:[],
    successmsg: "",
  });
  // const check = false;
});

// forgotpassword
router.post("/forgotpassword",  [
  check("password", "Please enter password")
  .exists()
  .trim()
  .isLength({ min: 5 }),
  check("newpassword")
  .trim()
  .isLength({ min: 5 })
  .withMessage("Password must be minlength 5 characters")
  .custom(async (newpassword, { req }) => {
    const password = req.body.password;
    if (password !== newpassword) {
      throw new Error("Password must be same");
    }
  }),
  ], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const alert = errors.array();

      res.render("admin/user/forgotpassword", {
        alert,title: "Forgot",
        opt: [],
        headermenu: [],
        settingmenu: [],
        userlogin:[],
        successmsg: "",
      });

    } else {

      const salt = await  bcrypt.genSalt(10);
      const hashpassword = await  bcrypt.hash(req.body.password, salt);
      
       await MongoClient.connect(url,function (err, db) {
          if (err) throw err;
          var dbo = db.db("conative");

          var myobj = {
            $set: {
              password: hashpassword,
            },
          };

          // console.log("psdfds",myobj); 

          var collection = dbo.collection("users");

          collection.updateOne(
            { _id: ObjectID(session.userid) },
            myobj,
            function (err, result) {
              if (err) {
                throw err;
              }
              // console.log("session",session.userid); 
              session.massage = "User password updated successfully";
              res.redirect("/changepassword");
            }
          );
   });
    }
  });


router.get("/userremove/:id", checkLogin, async function (req, res, next) {
    await MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db("conative");
      dbo.collection("users").remove({ _id: ObjectID(req.params.id) });
});
session.message = "User deleted successfully";

return res.redirect("/users");
});


module.exports = router;