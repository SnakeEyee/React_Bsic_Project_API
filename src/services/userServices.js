require("dotenv").config();
const db = require("better-sqlite3")(process.env.DBNAME);
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function createUser(req, res) {
  const { name, username, email, password } = req.body;
  try {
    const checkUsernameQuery =
      "SELECT * FROM Users WHERE Username = ? AND deleted_at IS NULL";
    const UsernameRow = db.prepare(checkUsernameQuery).get(username);
    if (UsernameRow) {
      return res.status(400).json({ Message: "Username already exists!" });
    }

    const checkEmailQuery =
      "SELECT * FROM Users WHERE Email = ? AND deleted_at IS NULL";
    const EmailRow = db.prepare(checkEmailQuery).get(email);
    if (EmailRow) {
      return res.status(400).json({ Message: "Email already exists!" });
    }

    const newPass = await bcrypt.hash(password, 10);
    const createdAt = new Date().toString();
    const query = `INSERT INTO Users(Username, Name, Email, Password, created_at) VALUES(?,?,?,?,?)`;
    db.prepare(query).run(username, name, email, newPass, createdAt);

    return res.status(201).json({ Message: "user created" });
  } catch (error) {
    console.log(error.message);

    return res.status(500).json({ Message: "Something went wrong" });
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  try {
    // Check if user exists
    const userQuery =
      "SELECT * FROM Users WHERE (Email = ? OR Username=?) AND deleted_at IS NULL";
    const user = db.prepare(userQuery).get(email, email);
    if (!user) {
      return res.status(404).json({ Message: "Invalid credentials!" });
    }

    // Check if password is correct
    const validPassword = await bcrypt.compare(password, user.Password);
    if (!validPassword) {
      return res.status(404).json({ Message: "Invalid credentials!" });
    }
    // Generate token
    const payload = {
      userId: user.ID,
      username: user.username,
    };

    const token = generateToken(payload);

    const updateTokenQuery = `UPDATE Users SET Token = ? WHERE Email = ? AND deleted_at IS NULL`;
    db.prepare(updateTokenQuery).run(token, email);

    return res
      .status(200)
      .json({ Message: "Logged In", Token: token, User: user.Username });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ Message: "Something went wrong" });
  }
}

async function getUserInfo(req, res) {
  try {
    const { userId } = req.user;
    const query = `SELECT ID, Username, Name, Email FROM Users WHERE ID = ? AND deleted_at IS NULL`;
    const user = db.prepare(query).get(userId);
    return res.status(200).json({ User: user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ Message: "Something went wrong" });
  }
}
const generateToken = (payload) => {
  var secretKey = process.env.SECRETKEY;
  const token = jwt.sign(payload, secretKey);
  return token;
};

async function logout(req, res) {
  const { userId } = req.user;
  try {
    const query = `UPDATE Users SET Token = NULL WHERE ID = ? AND deleted_at IS NULL`;
    db.prepare(query).run(userId);
    return res.status(200).json({ Message: "Logged Out" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ Message: "Something went wrong" });
  }
}

module.exports = { createUser, login, getUserInfo, logout };
