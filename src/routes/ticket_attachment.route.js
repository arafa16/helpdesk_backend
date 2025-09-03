const express = require("express");
const {
  createData,
  deleteData,
} = require("../controllers/ticket_attachment.controller");
const { verifyToken } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/data/:ticket_uuid", verifyToken, createData);
router.delete("/data/:uuid", verifyToken, deleteData);

module.exports = router;
