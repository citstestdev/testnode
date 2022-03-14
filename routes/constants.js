var express = require("express");
var router = express.Router();
var multer = require("multer");

var imagec = "";
// router.use("/imgupload", express.static(__dirname + "/imgupload"));
router.use("/imgupload", express.static(__dirname + "/imgupload"));
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    var path = require("path");
    imagec = new Date().toISOString().replace(/:/g, "-") + file.originalname;
    cb(null, "imgupload");
    cb(null, path.join(__dirname, "../conativesite/public/assets/imgupload"));
    // cb(null, path.join(__dirname, "../confrontend/public/assets/imgupload"));
  },
  filename: function (req, file, cb) {
    cb(null, imagec);
  },
});

var upload = multer({ storage: storage });

const url =
  "mongodb+srv://sample_user:admin@cluster0.kt5lv.mongodb.net/conative?retryWrites=true&w=majority";

module.exports = { upload, url };
