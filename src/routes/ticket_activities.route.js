const express = require("express");
const {
  updateData,
  deleteData,
} = require("../controllers/ticket_activity.controller");
const { verifyToken } = require("../middleware/auth.middleware");

const router = express.Router();

router.patch("/data/:uuid", verifyToken, updateData);
router.delete("/data/:uuid", verifyToken, deleteData);

module.exports = router;
