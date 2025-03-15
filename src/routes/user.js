const express = require("express");
const router = express.Router();
const {
  createUser,
  login,
  getUserInfo,
  logout,
} = require("../services/userServices");
const { Authorize } = require("../utils/auth");

router.post("/api/create-user", createUser);
router.post("/api/login", login);
router.get("/api/user", Authorize, (req, res) => {
  getUserInfo(req, res);
});
router.post("/api/logout", Authorize, (req, res) => {
  logout(req, res);
});

module.exports = router;
