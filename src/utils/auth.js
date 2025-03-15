require("dotenv").config();
const jwt = require("jsonwebtoken");
const db = require("better-sqlite3")(process.env.DBNAME);

function isTokenValidFormat(token) {
  // Check if the token has the correct format (header.payload.signature)
  const tokenParts = token.split(".");
  return tokenParts.length === 3;
}

function Authorize(req, res, next) {
  const secretKey = process.env.SECRETKEY;
  const BearerToken = req.headers.authorization;
  const token = BearerToken.replace("Bearer ", "");

  if (!BearerToken) {
    return res.status(401).json({ Message: "Unauthorized user - Missing" });
  }

  if (!isTokenValidFormat(token)) {
    return res.status(401).json({ Message: "Unauthorized - Malformed Token" });
  }

  const query = `SELECT Token FROM Users WHERE Token = ?`;
  const userToken = db.prepare(query).get(token);

  if (!userToken) {
    return res.status(401).json({ Message: "Unauthorized - Invalid Token" });
  }

  jwt.verify(token, secretKey, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ Message: "Unauthorized - Invalid Token" });
    }
    req.user = decoded;
    next();
  });
}

module.exports = { Authorize };
