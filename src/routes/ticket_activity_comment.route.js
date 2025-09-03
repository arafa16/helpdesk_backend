const express = require("express");
const {
  createData,
  deleteData,
} = require("../controllers/ticket_activity_comment.controller");
const { verifyToken } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/data", verifyToken, createData);
router.delete("/data/:uuid", verifyToken, deleteData);

module.exports = router;
