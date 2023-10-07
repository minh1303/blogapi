const bcrypt = require("bcryptjs");
const {Pool} = require("pg")
const jwt = require("jsonwebtoken")
const pool = new Pool({ connectionString: process.env.DB_LINK });

const authenticate = async (req, res, next) => {
  const { username, password } = req.body;
  await pool.connect();
  const q = await pool.query("SELECT * from users WHERE username=$1", [
    username,
  ]);
  console.log(q)
  if (!q.rows[0]) {
    res.status(403).json({ status:"fail",message: "User not found" });
  } else {
    const match = await bcrypt.compare(password, q.rows[0].password);
    if (match) {
      req.user = q.rows[0];
      next();
    } else res.status(403).json({ message: "Something went wrong" });
  }
};

const verifyToken = async(req,res,next) => {
  if (!req.headers.authorization) return res.status(401).send("")
  const token = req.headers.authorization.split(' ')[1];
  jwt.verify(token,process.env.SECRET_KEY,{}, (err, decoded) => {
    req.user = decoded;
    if(err) res.status(401).json({status:"fail"})
    else next()
  })
} 

module.exports = { authenticate, verifyToken };
