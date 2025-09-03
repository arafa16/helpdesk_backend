const { ticket_status: ticketStatusModel } = require("../models/index.js");
const { Op } = require("sequelize");
const CustomHttpError = require("../utils/custom_http_error.js");

const getDatas = async (req, res) => {
  const { uuid, name, sequence, code, sort } = req.query;

  const where = {};
  let order = [];

  if (sort) {
    const direction = sort.startsWith("-") ? "DESC" : "ASC";
    const columnName = sort.replace(/^-/, "");
    order.push([columnName, direction]);
  }

  if (uuid) {
    where.uuid = uuid;
  }

  if (name) {
    where.name = {
      [Op.like]: `%${name}%`,
    };
  }

  if (sequence) {
    where.sequence = sequence;
  }

  if (code) {
    where.code = code;
  }

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = Number(page - 1) * limit;

  const { count, rows } = await ticketStatusModel.findAndCountAll({
    where,
    limit,
    offset,
    order,
  });

  return res.status(200).json({
    success: true,
    message: "success",
    data: {
      count,
      rows,
    },
  });
};

const getDataById = async (req, res) => {
  const { uuid } = req.params;

  const findData = await ticketStatusModel.findOne({
    where: { uuid },
  });

  if (!findData) {
    throw new CustomHttpError("user status not found", 404);
  }

  return res.status(200).json({
    success: true,
    message: "success",
    data: findData,
  });
};

const createData = async (req, res) => {
  const { name, sequence, code } = req.body;

  if (!name || !sequence || !code) {
    throw new CustomHttpError("name, sequence, and code are required", 400);
  }

  const newData = await ticketStatusModel.create({
    name,
    sequence,
    code,
    is_active: true,
  });

  return res.status(201).json({
    success: true,
    message: "new data created successfully",
    data: newData,
  });
};

const updateData = async (req, res) => {
  const { uuid } = req.params;
  const { name, sequence, code, is_active } = req.body;

  const findData = await ticketStatusModel.findOne({
    where: { uuid },
  });

  if (!findData) {
    throw new CustomHttpError("data not found", 404);
  }

  await findData.update({
    name,
    sequence,
    code,
    is_active,
  });

  return res.status(200).json({
    success: true,
    message: "data updated successfully",
    data: findData,
  });
};

const deleteData = async (req, res) => {
  const { uuid } = req.params;
  const { permanent } = req.query;

  const findData = await ticketStatusModel.findOne({
    where: { uuid },
  });

  if (!findData) {
    throw new CustomHttpError("data not found", 404);
  }

  if (permanent) {
    if (permanent === "1") {
      await findData.destroy();

      return res.status(200).json({
        success: true,
        message: "data deleted permanent successfully",
      });
    } else {
      await findData.update({
        is_active: false,
      });

      return res.status(200).json({
        success: true,
        message: "data deleted successfully",
        data: findData,
      });
    }
  }

  await findData.update({
    is_active: false,
  });

  return res.status(200).json({
    success: true,
    message: "data deleted successfully",
  });
};

module.exports = {
  getDatas,
  getDataById,
  createData,
  updateData,
  deleteData,
};
