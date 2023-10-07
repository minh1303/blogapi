var express = require("express");
var router = express.Router();
var { authenticate } = require("../authentication");
require("dotenv").config();
var jwt = require("jsonwebtoken");
/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.post("/login", authenticate, async (req, res) => {
  console.log(req.body);
  jwt.sign(req.user, process.env.SECRET_KEY, {}, (err, token) => {
    if (err) {
      console.log(err);
      return res.status(401).json({
        status: "fail",
      });
    }
    res.status(200).json({
      status: "sucess",
      data: {
        token,
      },
    });
  });
});

module.exports = router;
