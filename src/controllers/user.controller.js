const {
  user: userModel,
  location: locationModel,
  division: divisionModel,
  user_status: userStatusModel,
  company: companyModel,
  privilege: privilegeModel,
  job_position: jobPositionModel,
  area: areaModel,
} = require("../models");
const { Op, where } = require("sequelize");
const CustomHttpError = require("../utils/custom_http_error.js");
const argon = require("argon2");

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

    whereClause = {
      ...whereClause,
      user_status_id: findStatus.id,
    };
  } else {
    // Exclude user_status_id 4 (deleted) if no filter is applied
    whereClause = {
      ...whereClause,
      user_status_id: { [Op.ne]: 4 },
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
        model: jobPositionModel,
        attributes: ["uuid", "name"],
      },
      {
        model: areaModel,
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
    where: {
      user_status_id: { [Op.ne]: 4 },
    },
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
        model: jobPositionModel,
        attributes: ["uuid", "name", "code"],
      },
      {
        model: areaModel,
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

  if (allUser.length > 0) {
    allUser.forEach((element) => {
      general_report[element.user_status.code].count += 1;
      general_report[4].count += 1;
    });
  }

  // allUser.forEach((user) => {
  //   if (user.user_status.code === "1") {
  //     general_report[1].count++;
  //   } else if (user.user_status.code === "2") {
  //     general_report[2].count++;
  //   } else if (user.user_status.code === "3") {
  //     general_report[3].count++;
  //   }
  //   general_report[4].count++;
  // });

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

const getDataById = async (req, res) => {
  const { uuid } = req.params;

  const user = await userModel.findOne({
    where: { uuid },
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
        model: jobPositionModel,
        attributes: ["uuid", "name", "code"],
      },
      {
        model: areaModel,
        attributes: ["uuid", "name", "code"],
      },
      {
        model: privilegeModel,
        attributes: {
          exclude: ["id"],
        },
      },
    ],
    attributes: { exclude: ["id", "password"] },
  });

  if (!user) {
    return new CustomHttpError("User not found", 404);
  }

  return res.status(200).json({
    success: true,
    message: "User data retrieved successfully",
    data: user,
  });
};

const getCreateAttributes = async (req, res) => {
  const location = await locationModel.findAll({
    attributes: ["uuid", "name", "code"],
  });
  const division = await divisionModel.findAll({
    attributes: ["uuid", "name", "code"],
  });
  const user_status = await userStatusModel.findAll({
    where: {
      is_active: true,
    },
    attributes: ["uuid", "name", "code"],
  });
  const company = await companyModel.findAll({
    where: {
      is_active: true,
    },
    attributes: ["uuid", "name"],
  });
  const job_position = await jobPositionModel.findAll({
    attributes: ["uuid", "name", "code"],
  });

  const area = await areaModel.findAll({
    attributes: ["uuid", "name", "code"],
  });

  return res.status(200).json({
    success: true,
    message: "User data retrieved successfully",
    data: null,
    attributes: {
      location,
      division,
      user_status,
      company,
      job_position,
      area,
    },
  });
};

const createData = async (req, res) => {
  const {
    name,
    email,
    password,
    nip,
    phone_number,
    location_uuid,
    division_uuid,
    user_status_uuid,
    company_uuid,
    job_position_uuid,
    area_uuid,
    dashboard,
    ticket,
    ticket_executor,
    ticket_customer,
    user,
    setting,
  } = req.body;

  let user_status_id = null;
  if (user_status_uuid) {
    const findStatus = await userStatusModel.findOne({
      where: { uuid: user_status_uuid },
    });
    if (!findStatus) {
      throw new CustomHttpError("User status not found", 404);
    }
    user_status_id = findStatus.id;
  }

  let location_id = null;
  if (location_uuid) {
    const findLocation = await locationModel.findOne({
      where: { uuid: location_uuid },
    });
    if (!findLocation) {
      throw new CustomHttpError("Location not found", 404);
    }
    location_id = findLocation.id;
  }

  let division_id = null;
  if (division_uuid) {
    const findDivision = await divisionModel.findOne({
      where: { uuid: division_uuid },
    });
    if (!findDivision) {
      throw new CustomHttpError("Division not found", 404);
    }
    division_id = findDivision.id;
  }

  let company_id = null;
  if (company_uuid) {
    const findCompany = await companyModel.findOne({
      where: { uuid: company_uuid },
    });
    if (!findCompany) {
      throw new CustomHttpError("Company not found", 404);
    }
    company_id = findCompany.id;
  }

  let job_position_id = null;
  if (company_uuid) {
    const findJobPosition = await jobPositionModel.findOne({
      where: { uuid: job_position_uuid },
    });
    if (!findJobPosition) {
      throw new CustomHttpError("Job Position not found", 404);
    }
    job_position_id = findJobPosition.id;
  }

  let area_id = null;
  if (area_uuid) {
    const findArea = await areaModel.findOne({
      where: { uuid: area_uuid },
    });
    if (!findArea) {
      throw new CustomHttpError("Area not found", 404);
    }
    area_id = findArea.id;
  }

  let hashedPassword = null;
  if (password) {
    hashedPassword = await argon.hash(password);
  }

  const user_result = await userModel.create({
    name: name,
    email: email,
    password: hashedPassword,
    nip: nip,
    phone_number: phone_number,
    location_id,
    division_id,
    user_status_id,
    job_position_id,
    area_id,
    company_id,
  });

  const newPrivilege = await privilegeModel.create({
    dashboard: dashboard !== undefined ? dashboard : false,
    ticket: ticket !== undefined ? ticket : false,
    ticket_executor: ticket_executor !== undefined ? ticket_executor : false,
    ticket_customer: ticket_customer !== undefined ? ticket_customer : false,
    user: user !== undefined ? user : false,
    setting: setting !== undefined ? setting : false,
  });
  user_result.privilege_id = newPrivilege.id;
  await user_result.save();

  return res.status(200).json({
    success: true,
    message: "User data updated successfully",
  });
};

const getUpdateAttributes = async (req, res) => {
  const { uuid } = req.params;

  const location = await locationModel.findAll({
    attributes: ["uuid", "name", "code"],
  });
  const division = await divisionModel.findAll({
    attributes: ["uuid", "name", "code"],
  });
  const user_status = await userStatusModel.findAll({
    where: {
      is_active: true,
    },
    attributes: ["uuid", "name", "code"],
  });
  const company = await companyModel.findAll({
    where: {
      is_active: true,
    },
    attributes: ["uuid", "name"],
  });

  const job_position = await jobPositionModel.findAll({
    attributes: ["uuid", "name", "code"],
  });

  const area = await areaModel.findAll({
    attributes: ["uuid", "name", "code"],
  });

  const user = await userModel.findOne({
    where: { uuid },
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
        model: jobPositionModel,
        attributes: ["uuid", "name"],
      },
      {
        model: areaModel,
        attributes: ["uuid", "name"],
      },
      {
        model: privilegeModel,
        attributes: { exclude: ["id"] },
      },
    ],
    attributes: { exclude: ["id", "password"] },
  });

  if (!user) {
    throw new CustomHttpError("User not found", 404);
  }
  return res.status(200).json({
    success: true,
    message: "User data retrieved successfully",
    data: user,
    attributes: {
      location,
      division,
      user_status,
      company,
      job_position,
      area,
    },
  });
};

const updateData = async (req, res) => {
  const { uuid } = req.params;
  const {
    name,
    email,
    nip,
    phone_number,
    location_uuid,
    division_uuid,
    user_status_uuid,
    company_uuid,
    job_position_uuid,
    area_uuid,
    dashboard,
    ticket,
    ticket_executor,
    ticket_customer,
    is_customer,
    is_executor,
    user,
    setting,
  } = req.body;

  const findUser = await userModel.findOne({
    where: { uuid },
    include: [
      {
        model: privilegeModel,
      },
    ],
  });

  if (!findUser) {
    throw new CustomHttpError("User not found", 404);
  }

  let user_status_id = null;
  if (user_status_uuid) {
    const findStatus = await userStatusModel.findOne({
      where: { uuid: user_status_uuid },
    });
    if (!findStatus) {
      throw new CustomHttpError("User status not found", 404);
    }
    user_status_id = findStatus.id;
  }

  let location_id = null;
  if (location_uuid) {
    const findLocation = await locationModel.findOne({
      where: { uuid: location_uuid },
    });
    if (!findLocation) {
      throw new CustomHttpError("Location not found", 404);
    }
    location_id = findLocation.id;
  }

  let division_id = null;
  if (division_uuid) {
    const findDivision = await divisionModel.findOne({
      where: { uuid: division_uuid },
    });
    if (!findDivision) {
      throw new CustomHttpError("Division not found", 404);
    }
    division_id = findDivision.id;
  }

  let company_id = null;
  if (company_uuid) {
    const findCompany = await companyModel.findOne({
      where: { uuid: company_uuid },
    });
    if (!findCompany) {
      throw new CustomHttpError("Company not found", 404);
    }
    company_id = findCompany.id;
  }

  let job_position_id = null;
  if (job_position_uuid) {
    const findJobPosition = await jobPositionModel.findOne({
      where: { uuid: job_position_uuid },
    });
    if (!findJobPosition) {
      throw new CustomHttpError("Job Position not found", 404);
    }
    job_position_id = findJobPosition.id;
  }

  let area_id = null;
  if (area_uuid) {
    const findArea = await areaModel.findOne({
      where: { uuid: area_uuid },
    });
    if (!findArea) {
      throw new CustomHttpError("Area not found", 404);
    }
    area_id = findArea.id;
  }

  const user_update = await findUser.update({
    name: name || findUser.name,
    email: email || findUser.email,
    nip: nip || findUser.nip,
    phone_number: phone_number || findUser.phone_number,
    location_id,
    division_id,
    user_status_id,
    company_id,
    job_position_id,
    is_customer,
    is_executor,
    area_id,
  });

  if (findUser.privilege_id !== null) {
    await privilegeModel.update(
      {
        dashboard:
          dashboard !== undefined ? dashboard : findUser.privilege.dashboard,
        ticket: ticket !== undefined ? ticket : findUser.privilege.ticket,
        ticket_executor:
          ticket_executor !== undefined
            ? ticket_executor
            : findUser.privilege.ticket_executor,
        ticket_customer:
          ticket_customer !== undefined
            ? ticket_customer
            : findUser.privilege.ticket_customer,
        user:
          user !== undefined && user !== "" ? user : findUser.privilege.user,
        setting: setting !== undefined ? setting : findUser.privilege.setting,
      },
      {
        where: { id: findUser.privilege.id },
      }
    );
  } else {
    const newPrivilege = await privilegeModel.create({
      dashboard: dashboard !== undefined ? dashboard : false,
      ticket: ticket !== undefined ? ticket : false,
      ticket_executor: ticket_executor !== undefined ? ticket_executor : false,
      ticket_customer: ticket_customer !== undefined ? ticket_customer : false,
      user: user !== undefined && user !== "" ? user : false,
      setting: setting !== undefined ? setting : false,
    });
    user_update.privilege_id = newPrivilege.id;
    await user_update.save();
  }

  return res.status(200).json({
    success: true,
    message: "User data updated successfully",
  });
};

const deleteData = async (req, res) => {
  const { uuid } = req.params;
  const user = await userModel.findOne({ where: { uuid } });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  await user.update({ is_active: false, user_status_id: 4 }); // Assuming 4 is the ID for 'deleted' status

  return res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
};

const changePassword = async (req, res) => {
  const { password, conf_password } = req.body;

  if (password !== conf_password) {
    throw new CustomHttpError("password not match, please check again", 401);
  }

  console.log("user", req.user);

  const user = await userModel.findOne({
    where: {
      id: req.user.id,
    },
  });

  const hasPassword = await argon.hash(password);

  await user.update({
    password: hasPassword,
  });

  return res.status(201).json({
    success: true,
    message: "Change Password Success",
  });
};

module.exports = {
  getDatas,
  getDataTable,
  getDataById,
  createData,
  getCreateAttributes,
  getUpdateAttributes,
  updateData,
  deleteData,
  changePassword,
};
