var express = require("express");
var router = express.Router();
var { getPosts, getPost, createPost, updatePost, deletePost } = require("../queries");
var { verifyToken } = require("../authentication");

router.get("/", getPosts);


router.get("/:id", getPost);
router.post("/", verifyToken, createPost);
router.put("/:id", verifyToken, updatePost);
router.delete("/:id", verifyToken, deletePost);

module.exports = router;
