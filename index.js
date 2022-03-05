var createError = require("http-errors");
const express = require("express");
const app = express();
var path = require("path");
const helmet = require("helmet");
const fs = require("fs");
const ejs = require("ejs");
var expressLayout = require("express-ejs-layouts");
const mongoose = require("mongoose");
var bodyParser = require("body-parser");
const flash = require("connect-flash");
var cookieParser = require("cookie-parser");
const session = require("express-session");
var jwt = require("jsonwebtoken");
var checkLogin = require("./middleware/check");
const bcrypt = require("bcrypt");
const cors = require("cors");
var axios = require("axios");
const async = require("async");
var multer = require("multer");
var logger = require("morgan");
const mongodb = require("mongodb");
// const { createProxyMiddleware } = require("http-proxy-middleware");
const { check, validationResult } = require("express-validator");

const register = require("./models/Registermodel");

// run this port
app.listen(process.env.PORT || 5000);

// var SettingRouter = require('./')
var SettingRouter = require("./routes/common/setting");

//  ======================== menu ============================
var menuRoutes = require("./routes/common/menuRoutes");
var bothmenuRoutes = require("./routes/common/bothmenuRoutes");

var socialRoutes = require("./routes/common/socialRoutes");
var contactRoutes = require("./routes/common/contactRoutes");
var AboutFirstRoutes = require("./routes/aboutus/AboutFirstRoutes");

// ============== adminRouter =========================================
var homeRoutes = require("./routes/admin/homeRoutes");
var expertiseRoutes = require("./routes/admin/expertiseRoutes");
var ourProjectsRouters = require("./routes/admin/ourProjectsRouters");
var digitallegacyRoutes = require("./routes/admin/digitallegacyRoutes");
var ourProcessRouters = require("./routes/admin/ourProcessRouters");
var clientProject = require("./routes/admin/clientProjectRoutes");
var startProjectRoutes = require("./routes/admin/startProjectRoutes");

// ======================= PortfolioRoutes =========================
var PortfolioRoutes = require("./routes/portfolio/PortfolioRoutes");

app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(helmet());
app.use(express.json());

const urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(bodyParser.json());

app.use(express.static("public"));
app.use(expressLayout);

app.use(
  session({
    secret: "secret token",
    resave: false,
    saveUninitialized: true,
    unset: "destroy",
    name: "session cookie name",
    genid: (req) => {
      // Returns a random string to be used as a session ID
    },
  })
);

// app.use(
//   "/",
//   createProxyMiddleware({
//     target: "http://localhost:5000/",
//     changeOrigin: true,
//   })
// );
// app.listen(3000);

app.use(flash());

var corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept,Authorization, Cross-Origin-Resource-Policy"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET,PUT,PATCH,POST,DELETE,OPTIONS"
  );
  res.header(
    "Cross-Origin-Resource-Policy: same-site | same-origin | cross-origin"
  );
  next();
});

app.use("/uploads", express.static(__dirname + "/uploads"));
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname);
  },
});

var upload = multer({ storage: storage });

// app.listen(process.env.PORT || 5000)

app.use("/", SettingRouter);
app.use("/", menuRoutes);
app.use("/", bothmenuRoutes);
app.use("/", socialRoutes);
app.use("/", contactRoutes);
app.use("/", AboutFirstRoutes);
app.use("/", homeRoutes);
app.use("/", expertiseRoutes);
app.use("/", ourProjectsRouters);
app.use("/", digitallegacyRoutes);
app.use("/", ourProcessRouters);
app.use("/", clientProject);
app.use("/", startProjectRoutes);

app.use("/", PortfolioRoutes);

try {
  mongoose.connect(
    process.env.MONGODB_URI ||
      `mongodb+srv://sample_user:admin@cluster0.kt5lv.mongodb.net/conative?retryWrites=true&w=majority`
  );
  var MongoClient = require("mongodb").MongoClient;
  // var url = "mongodb://localhost:27017?ssl=true";
  var url =
    "mongodb+srv://sample_user:admin@cluster0.kt5lv.mongodb.net/conative?retryWrites=true&w=majority";
  var { ObjectID } = require("mongodb");
  console.log("connected to database.");
} catch (error) {
  console.log("could not connect to database", error);
}

app.get("/option-show", async function (req, res, next) {
  var fullUrl = req.protocol + "://" + req.get("host");

  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");
    var footerarr = [];
    dbo.collection("option").findOne(function (err, result1) {
      footerarr = result1;
      res.status(200).json(result1);
    });
  });
});

app.get("/social-media", async function (req, res, next) {
  var fullUrl = req.protocol + "://" + req.get("host");

  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");
    dbo
      .collection("socials")
      .find()
      .toArray(function (err, result) {
        console.log(result);
        if (err) {
          return;
        }
        console.log(err);
        res.status(200).json(result);
      });
  });
});

app.get("/setting", checkLogin, async function (req, res, next) {
  await MongoClient.connect(url, function (err, db) {
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
        setting_dynamic = result;
      });

    dbo.collection("option").findOne(function (err, result) {
      if (err) {
        return;
      }
      if (!result) {
        res.send("Page Not Found Please Check Collection");
        console.log(err);
      } else {
        res.render("admin/home/setting", {
          title: "setting",
          opt: result,
          headermenu: headermenu_dynamic,
          settingmenu: setting_dynamic,
          msg: "",
        });
      }
    });
  });
});

///      ==================== login     ========================

app.post("/checklogin", async function (req, res, next) {
  const { Loginmodel, validate } = require("./models/Loginmodel");

  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");

    var username = req.body.email;
    dbo
      .collection("users")
      .findOne(
        { email: req.body.email, password: req.body.password },
        function (err, result) {
          if (result) {
            var user = {
              _id: result._id,
              email: result.email,
            };

            var token = jwt.sign(user, "seceret");
            // console.log(token);
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          }

          if (jwt.verify(token, "seceret")) {
            var decode = jwt.verify(token, "seceret");
            res.cookie(`token`, token, { maxAge: 3000, httpOnly: true });

            sessions.tokenseesion = token;
            //  console.log(req.sessions);
            res.redirect("/portfolio");
          } else {
            res.status(401).json({
              error: "Invalid Token",
            });
          }
        }
      );
  });
});

///      ==================== login part  ========================

// app.get("/", async function(req, res, next){
//   return res.redirect("/admin");
// });

app.get("/register", async function (req, res, next) {
  let token = req.cookies.token ? true : false;

  if (token) {
    return res.redirect("/home");
  }

  return res.render("common/register");
});

app.get("/admin", (req, res) => {
  let bad_auth = req.query.msg ? true : false;
  let token = req.cookies.token ? true : false;

  if (token) {
    return res.redirect("/home");
  }
  // if there exists, send the error.
  if (bad_auth) {
    return res.render("common/login_1", {
      error: "Invalid username or password",
    });
  } else {
    // else just render the login
    return res.render("common/login_1", { opt: [] });
  }
});

app.get("/home", checkLogin, (req, res) => {
  let username = req.cookies.username;
  let token = req.cookies.token ? true : false;

  if (!token) {
    return res.redirect("/admin");
  }
  // render welcome page
  return res.redirect("/home");
});

app.post("/process_login", async (req, res) => {
  // get the data
  let { username, password } = req.body;

  await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("conative");

    dbo
      .collection("users")
      .findOne({ email: username }, async function (err, result) {
        // basic check

        if (!result) {
          return res.redirect("/admin?msg=fail");
        } else {
          const validPassword = await bcrypt.compare(
            req.body.password,
            result.password
          );
          if (validPassword && username === result.email) {
            var user = {
              _id: result._id,
              email: result.email,
            };
            // session.massage = "Login successfully";
            var token = jwt.sign(user, "seceret");
            res.cookie("token", token);
            res.cookie("username", username);
            // redirect
            return res.redirect("/home");
          } else {
            return res.redirect("/admin?msg=fail");
          }
        }
      });
  });
});

app.post(
  "/adduser",
  urlencodedParser,
  [
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
          throw new Error("Passwords must be same");
        }
      }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const alert = errors.array();
      res.render("common/register", {
        alert,
      });
    } else {
      const salt = await bcrypt.genSalt(10);
      // console.log("nooo");
      const hashpassword = await bcrypt.hash(req.body.password, salt);

      var myobj = new register({
        username: req.body.username.trim(),
        email: req.body.email.trim(),
        password: hashpassword.trim(),
      });
      myobj.save();
      return res.redirect("/admin");
    }
    // setTimeout(function(){ return res.redirect("/welcome"); }, 5000);
  }
);

app.get("/logout", (req, res) => {
  // clear the cookie
  res.clearCookie("token");
  res.clearCookie("username");
  req.flash(
    "success",
    `You've been successfully redirected to the Message route!`
  );

  return res.redirect("/admin");
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var fullUrl = req.protocol + "://" + req.get("host") + req.originalUrl;
  if (req.originalUrl === "/adduser") {
    res.redirect("/register");
  } else {
    next(createError(404));
  }
});

module.exports = app;
