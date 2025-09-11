const express = require("express");
const {
  getDataTable,
  getCreateDataAttribute,
  createData,
  updateStatusDataById,
  getDataById,
  getDataTableExecutor,
  getDataTableCustomer,
  getEditDataAttribute,
  updateData,
  deleteData,
} = require("../controllers/ticket.controller");
const { verifyToken } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/create", verifyToken, getCreateDataAttribute);
router.post("/data", verifyToken, createData);
router.get("/data/:uuid", verifyToken, getDataById);
router.get("/data/:uuid/edit", verifyToken, getEditDataAttribute);
router.patch("/data/:uuid/edit", verifyToken, updateData);
router.patch("/data/:uuid/status", verifyToken, updateStatusDataById);
router.get("/table", verifyToken, getDataTable);
router.get("/table/executor", verifyToken, getDataTableExecutor);
router.get("/table/customer", verifyToken, getDataTableCustomer);
router.delete("/data/:uuid", verifyToken, deleteData);

module.exports = router;
