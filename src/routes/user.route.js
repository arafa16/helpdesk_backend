const express = require("express");
const {
  getDatas,
  getDataTable,
  getDataById,
  getUpdateAttributes,
  updateData,
  getCreateAttributes,
  createData,
  deleteData,
  changePassword,
} = require("../controllers/user.controller");
const { verifyToken } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/datas", verifyToken, getDatas);
router.get("/table", verifyToken, getDataTable);
router.get("/data/:uuid", verifyToken, getDataById);
router.get("/update_attributes/:uuid", verifyToken, getUpdateAttributes);
router.patch("/data/:uuid", verifyToken, updateData);
router.get("/create_attributes", verifyToken, getCreateAttributes);
router.post("/data", verifyToken, createData);
router.delete("/data/:uuid", verifyToken, deleteData);
router.patch("/change_password", verifyToken, changePassword);

module.exports = router;
