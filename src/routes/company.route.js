const express = require("express");
const {
  getDatas,
  getDataById,
  getDataFirst,
  createData,
  updateData,
  deleteData,
} = require("../controllers/company.controller");
const { verifyToken } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/datas", verifyToken, getDatas);
router.get("/data/:uuid", verifyToken, getDataById);
router.get("/first", getDataFirst);
router.post("/data", verifyToken, createData);
router.patch("/data/:uuid", verifyToken, updateData);
router.delete("/data/:uuid", verifyToken, deleteData);

module.exports = router;
