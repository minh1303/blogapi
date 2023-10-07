var express = require("express");
var router = express.Router();
var {verifyToken} = require("../authentication")
var {
  getUser,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} = require("../queries");

router.get("/", getUsers);

router.get("/:id", getUser);
router.post("/" ,createUser); 
router.put("/:id", verifyToken, updateUser);
router.delete("/:id", verifyToken, deleteUser);
module.exports = router;
