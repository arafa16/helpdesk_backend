const express = require("express");
const {
  createData,
  deleteData,
} = require("../controllers/ticket_user_reminder.controller");
const { verifyToken } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/data", verifyToken, createData);
router.delete("/data/:uuid", verifyToken, deleteData);

module.exports = router;
