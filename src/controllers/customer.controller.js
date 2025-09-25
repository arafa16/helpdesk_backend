const { customer: customerModel } = require("../models/index.js");
const { Op } = require("sequelize");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");
const CustomHttpError = require("../utils/custom_http_error.js");

const getDatas = async (req, res) => {
  const { uuid, name, sort } = req.query;

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

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = Number(page - 1) * limit;

  const { count, rows } = await customerModel.findAndCountAll({
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

const getDataTable = async (req, res) => {
  const { search, is_active } = req.query;
  let whereClause = {};

  if (search) {
    whereClause = {
      ...whereClause,
      [Op.or]: [{ name: { [Op.like]: `%${search}%` } }],
    };
  }

  if (is_active) {
    whereClause.is_active = is_active;
  } else {
    whereClause.is_active = true;
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const offset = (page - 1) * limit;
  const data = await customerModel.findAndCountAll({
    where: whereClause,
    limit,
    offset,
  });

  const pages = Math.ceil(data.count / limit);

  return res.status(200).json({
    success: true,
    message: "Get user status successfully",
    data: data.rows,
    meta: {
      total: data.count,
      page,
      limit,
      pages,
    },
  });
};

const getDataById = async (req, res) => {
  const { uuid } = req.params;

  const findData = await customerModel.findOne({
    where: { uuid },
  });

  if (!findData) {
    throw new CustomHttpError("data not found", 404);
  }

  return res.status(200).json({
    success: true,
    message: "success",
    data: findData,
  });
};

const createData = async (req, res) => {
  const { name, address, pic, phone_number } = req.body;

  if (req.files && req.files.file) {
    const file = req.files.file;
    const fileSize = file.data.length;

    const ext = path.extname(file.name);
    const file_name = crypto.randomUUID() + ext;
    const file_link = `/attributes/images/customers/${file_name}`;
    const allowed_type = [".png", ".jpg", ".jpeg"];

    if (!allowed_type.includes(ext)) {
      throw new CustomHttpError("Invalid file type", 422);
    }

    if (fileSize > 5000000) {
      throw new CustomHttpError("Image must be less than 5 MB", 422);
    }

    file.mv(
      `./public/attributes/images/customers/${file_name}`,
      async (err) => {
        if (err) {
          throw new CustomHttpError("Error uploading file", 500);
        }

        const newData = await customerModel.create({
          name,
          address,
          pic,
          phone_number,
          logo: file_name,
          logo_url: file_link,
        });

        return res.status(201).json({
          success: true,
          message: "file uploaded",
          data: newData,
        });
      }
    );
  } else {
    const newData = await customerModel.create({
      name,
      address,
    });

    return res.status(201).json({
      success: true,
      message: "file uploaded",
      data: newData,
    });
  }
};

const updateData = async (req, res) => {
  const { uuid } = req.params;
  const { name, address, pic, phone_number } = req.body;

  const findData = await customerModel.findOne({
    where: { uuid },
  });

  if (!findData) {
    throw new CustomHttpError("data not found", 404);
  }

  if (req.files && req.files.file) {
    const file = req.files.file;
    const fileSize = file.data.length;

    const ext = path.extname(file.name);
    const file_name = crypto.randomUUID() + ext;
    const file_link = `/attributes/images/customers/${file_name}`;
    const allowed_type = [".png", ".jpg", ".jpeg"];

    if (!allowed_type.includes(ext)) {
      throw new CustomHttpError("Invalid file type", 422);
    }

    if (fileSize > 5000000) {
      throw new CustomHttpError("Image must be less than 5 MB", 422);
    }

    fs.unlinkSync(`./public/attributes/images/companies/${findData.logo}`);

    file.mv(
      `./public/attributes/images/companies/${file_name}`,
      async (err) => {
        if (err) {
          throw new CustomHttpError("Error uploading file", 500);
        }

        await findData.update({
          name,
          address,
          pic,
          phone_number,
          logo: file_name,
          logo_url: file_link,
        });

        return res.status(200).json({
          success: true,
          message: "data updated successfully",
        });
      }
    );
  } else {
    await findData.update({
      name,
      address,
    });

    return res.status(200).json({
      success: true,
      message: "data updated successfully",
    });
  }
};

const deleteData = async (req, res) => {
  const { uuid } = req.params;
  const { permanent } = req.query;

  const findData = await customerModel.findOne({
    where: { uuid },
  });

  if (!findData) {
    throw new CustomHttpError("data not found", 404);
  }

  if (permanent) {
    if (permanent === "1") {
      await findData.destroy();

      fs.unlinkSync(`./public${findData.logo_url}`);

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
  getDataTable,
  getDataById,
  createData,
  updateData,
  deleteData,
};
