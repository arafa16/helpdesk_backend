const {
  user: userModel,
  location: locationModel,
  division: divisionModel,
  user_status: userStatusModel,
  company: companyModel,
  privilege: privilegeModel,
} = require("../models");
const { Op } = require("sequelize");
const CustomHttpError = require("../utils/custom_http_error.js");

const getDatas = async (req, res) => {
  try {
    const users = await userModel.findAll();
    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getDataTable = async (req, res) => {
  const { search, user_status_uuid, location_uuid } = req.query;

  let whereClause = {};

  if (search) {
    whereClause = {
      ...whereClause,
      [Op.or]: [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ],
    };
  }

  if (user_status_uuid) {
    const findStatus = await userStatusModel.findOne({
      where: { uuid: user_status_uuid },
    });

    if (!findStatus) {
      throw new CustomHttpError("user status not found", 404);
    }

    console.log("User status found:", findStatus);

    whereClause = {
      ...whereClause,
      user_status_id: findStatus.id,
    };
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const offset = (page - 1) * limit;

  const users = await userModel.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: userStatusModel,
        attributes: ["uuid", "name", "code"],
      },
      {
        model: locationModel,
        attributes: ["uuid", "name", "code"],
      },
      {
        model: divisionModel,
        attributes: ["uuid", "name", "code"],
      },
      {
        model: companyModel,
        attributes: ["uuid", "name"],
      },
      {
        model: privilegeModel,
        attributes: {
          exclude: ["id"],
        },
      },
    ],
    offset,
    limit,
  });

  const pages = Math.ceil(users.count / limit);

  //general report

  let general_report = {
    1: { name: "Register", count: 0 },
    2: { name: "Active", count: 0 },
    3: { name: "Non Active", count: 0 },
    4: { name: "All", count: 0 },
  };

  const allUser = await userModel.findAll({
    include: [
      {
        model: userStatusModel,
        attributes: ["uuid", "name", "code"],
      },
      {
        model: locationModel,
        attributes: ["uuid", "name", "code"],
      },
      {
        model: divisionModel,
        attributes: ["uuid", "name", "code"],
      },
      {
        model: privilegeModel,
        attributes: {
          exclude: ["id"],
        },
      },
    ],
  });

  const user_status = await userStatusModel.findAll();

  allUser.forEach((user) => {
    if (user.user_status.code === "1") {
      general_report[1].count++;
    } else if (user.user_status.code === "2") {
      general_report[2].count++;
    } else if (user.user_status.code === "3") {
      general_report[3].count++;
    }
    general_report[4].count++;
  });

  return res.status(200).json({
    success: true,
    message: "User data retrieved successfully",
    data: users.rows,
    meta: {
      total: users.count,
      page,
      limit,
      pages,
    },
    general_report,
    user_status,
  });
};

module.exports = {
  getDatas,
  getDataTable,
};
