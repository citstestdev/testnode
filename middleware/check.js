module.exports = (req, res, next) => {
  let token = req.cookies.token ? true : false;
  if (token) {
    console.log("hello", token);
    next();
  } else {
    res.render("errorpage", {
      opt: "",
      msg: "Oops! That page can’t be found.",
    });
  }
};
