const { Pool } = require("pg");
require("dotenv").config();
const bcrypt = require("bcryptjs");
const { rowExists } = require("./queryHelper");
const pool = new Pool({ connectionString: process.env.DB_LINK });

const getUsers = async (req, res) => {
  try {
    await pool.connect();
    const q = await pool.query("SELECT user_id,username FROM users");
    res.status(200).json({
      status: "success",
      data: q.rows,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      status: "error",
      message: "Not found!",
    });
  }
};

const getUser = async (req, res) => {
  try {
    await pool.connect();
    const q = await pool.query(
      "SELECT user_id,username FROM users WHERE user_id=$1",
      [req.params.id]
    );

    if (q.rows[0]) {
      return res.status(200).json({
        status: "success",
        data: q.rows[0],
      });
    } else {
      return res.status(404).json({
        status: "fail",
        message: "User doesn't exist!",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

const createUser = async (req, res) => {
  await pool.connect();
  const q = await pool.query("SELECT COUNT(1) FROM users WHERE username=$1", [
    req.body.username,
  ]);
  if (parseInt(q.rows[0].count) !== 0) {
    return res
      .status(403)
      .json({ status: "fail", message: "User already exists" });
  } else {
    await bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
      if (err) throw err;
      try {
        await pool.query("INSERT INTO users(username,password) VALUES($1,$2)", [
          req.body.username,
          hashedPassword,
        ]);
        res.status(201).json({ status: "success" });
      } catch (error) {
        res.status(401).json({ status: "fail" });
      }
    });
  }
};

const updateUser = async (req, res) => {
  try {
    await pool.connect();
    const q = await pool.query(
      "UPDATE users SET password=$1 WHERE user_id=$2",
      [req.body.password, req.params.id]
    );
    res.status(200).json({
      status: "success",
      message: "Updated",
    });
  } catch (error) {
    res.status(403).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    await pool.connect();
    const q = await pool.query("DELETE FROM users WHERE user_id=$1", [
      req.params.id,
    ]);
    if (!q.rows[0]) {
      return res.status(404).json({ status: "fail", message: "Not found" });
    }
    res.status(200).json({
      status: "success",
      message: "Deleted",
    });
  } catch (error) {
    res.status(403).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

const getPosts = async (req, res) => {
  await pool.connect();
  const q = await pool.query("SELECT * FROM posts");
  res.status(200).json({ status: "success", data: q.rows });
};

const getPost = async (req, res) => {
  await pool.connect();
  const q = await pool.query("SELECT * FROM posts WHERE post_id=$1", [
    req.params.id,
  ]);
  res.status(200).json({ status: "sucess", data: q.rows[0] });
};

const createPost = async (req, res) => {
  try {
    await pool.connect();
    await pool.query(
      "INSERT INTO posts(title, content, user_id, published) VALUES($1,$2,$3,$4)",
      [req.body.title, req.body.content, req.user.user_id, req.body.published]
    );
    res.status(201).json({ status: "success" });
  } catch (error) {
    console.error(error);
    res.status(403).json({ status: "error", message: "Something went wrong" });
  }
};

const updatePost = async (req, res) => {
  try {
    const now = new Date();
    await pool.connect();
    const q = await pool.query(
      "UPDATE posts SET title=$1, content=$2, published=$3, updated_at=$4 WHERE post_id=$5 AND user_id=$6",
      [
        req.body.title,
        req.body.content,
        req.body.published,
        now,
        req.params.id,
        req.user.user_id,
      ]
    );
    if (!rowExists(q)) return res.status(404).json({ status: "fail" });
    res.status(200).json({ status: "success" });
  } catch (error) {
    console.error(error);
    res.status(403).json({ status: "error", message: error });
  }
};

const deletePost = async (req, res) => {
  try {
    await pool.connect();
    const q = await pool.query(
      "DELETE FROM posts WHERE post_id=$1 AND user_id=$2",
      [req.params.id, req.user.user_id]
    );
    if (!rowExists(q)) return res.status(404).json({ status: "fail" });
    res.status(200).json({ status: "success" });
  } catch (error) {
    console.error(error);
    res.status(403).json({ status: "error", message: "Something went wrong" });
  }
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
};
