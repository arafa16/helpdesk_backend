const express = require("express");
const {
  getDatas,
  getDataById,
  createData,
  updateData,
  deleteData,
} = require("../controllers/user_status.controller");
const { verifyToken } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/datas", verifyToken, getDatas);
router.get("/data/:uuid", verifyToken, getDataById);
router.post("/data", verifyToken, createData);
router.patch("/data/:uuid", verifyToken, updateData);
router.delete("/data/:uuid", verifyToken, deleteData);

module.exports = router;
