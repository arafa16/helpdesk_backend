const express = require("express");
const {
  register,
  registerAttribute,
  login,
  getMe,
  sendEmailReset,
  getTokenReset,
  resetPassword,
  logout,
} = require("../controllers/auth.controller");
const { verifyToken } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/register", register);
router.get("/register", registerAttribute);
router.post("/login", login);
router.get("/me", verifyToken, getMe);
router.post("/mail", sendEmailReset);
router.get("/reset/:token", getTokenReset);
router.post("/reset/:token", resetPassword);
router.delete("/logout", logout);

module.exports = router;
