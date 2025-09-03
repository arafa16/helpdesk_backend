const {
  ticket: ticketModel,
  location: locationModel,
  area: areaModel,
  ticket_access: ticketAccessModel,
  ticket_category: ticketCategoryModel,
  ticket_status: ticketStatusModel,
  ticket_activity: ticketActivityModel,
  user: userModel,
  customer: customerModel,
  ticket_history: ticketHistoryModel,
  ticket_attachment: ticketAttachmentModel,
  ticket_activity_attachment: ticketActivityAttachmentModel,
  ticket_activity_comment: ticketActivityCommentModel,
  ticket_user_reminder: ticketUserReminderModel,
  privilege: privilegeModel,
} = require("../models");
const CustomHttpError = require("../utils/custom_http_error.js");
const {
  createTicketHistory,
} = require("../controllers/ticket_history.controller.js");
const { Op, where } = require("sequelize");

const createTicketActivity = (data) => {
  return ticketActivityModel.create({
    ticket_id: data.ticket_id,
    user_id: data.user_id,
    ticket_status_id: data.ticket_status_id,
    description: data.description,
    reminder: data.reminder,
    schedule_reminder: data.schedule_reminder,
  });
};

const getDataTable = async (req, res) => {
  const { search, ticket_status_uuid, area_uuid } = req.query;

  let whereClause = {};

  if (search) {
    whereClause = {
      ...whereClause,
      [Op.or]: [
        { display_name: { [Op.like]: `%${search}%` } },
        { subject: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { network_number: { [Op.like]: `%${search}%` } },
        { address: { [Op.like]: `%${search}%` } },
        { case_number: { [Op.like]: `%${search}%` } },
      ],
    };
  }

  if (ticket_status_uuid) {
    const findStatus = await ticketStatusModel.findOne({
      where: { uuid: ticket_status_uuid },
    });

    if (!findStatus) {
      throw new CustomHttpError("ticket status not found", 404);
    }

    whereClause = {
      ...whereClause,
      ticket_status_id: findStatus.id,
    };
  }

  if (area_uuid) {
    const findArea = await areaModel.findOne({
      where: { uuid: area_uuid },
    });

    if (!findArea) {
      throw new CustomHttpError("area not found", 404);
    }

    whereClause = {
      ...whereClause,
      area_id: findArea.id,
    };
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 0;

  const offset = (page - 1) * limit;

  const ticket = await ticketModel.findAndCountAll({
    where: whereClause,
    include: [
      { model: customerModel, attributes: ["uuid", "name"] },
      { model: areaModel, attributes: ["uuid", "name"] },
      { model: ticketStatusModel, attributes: ["uuid", "name", "code"] },
      { model: ticketAccessModel, attributes: ["uuid", "name"] },
      { model: ticketCategoryModel, attributes: ["uuid", "name"] },
      { model: userModel, attributes: ["uuid", "name"], as: "executor" },
      { model: userModel, attributes: ["uuid", "name"], as: "user" },
    ],
    offset,
    limit,
  });

  const pages = Math.ceil(parseInt(ticket.count) / limit);

  //general report

  let general_report = {
    1: { name: "Draft", count: 0 },
    2: { name: "On The Way", count: 0 },
    3: { name: "Analizy", count: 0 },
    4: { name: "Handling Activity", count: 0 },
    5: { name: "Done", count: 0 },
    6: { name: "Canceled", count: 0 },
    7: { name: "All", count: 0 },
  };

  const allTicket = await ticketModel.findAll({
    where: {
      is_active: true,
    },
    include: [
      {
        model: ticketStatusModel,
        attributes: { exclude: ["id", "createdAt", "updatedAt"] },
      },
    ],
  });

  const ticket_status = await ticketStatusModel.findAll();

  if (allTicket.length > 0) {
    allTicket.forEach((element) => {
      general_report[element.ticket_status.code].count += 1;
      general_report[7].count += 1;
    });
  }

  return res.status(200).json({
    success: true,
    message: "Ticket data retrieved successfully",
    data: ticket.rows,
    meta: {
      total: ticket.count,
      page,
      limit,
      pages,
    },
    general_report: general_report,
    ticket_status,
    user: req.user,
  });
};

const getDataTableExecutor = async (req, res) => {
  const { search, ticket_status_uuid, area_uuid } = req.query;

  let whereClause = {};

  whereClause = {
    ...whereClause,
    executor_id: req.user.id,
  };

  if (search) {
    whereClause = {
      ...whereClause,
      [Op.or]: [
        { display_name: { [Op.like]: `%${search}%` } },
        { subject: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { network_number: { [Op.like]: `%${search}%` } },
        { address: { [Op.like]: `%${search}%` } },
        { case_number: { [Op.like]: `%${search}%` } },
      ],
    };
  }

  if (ticket_status_uuid) {
    const findStatus = await ticketStatusModel.findOne({
      where: { uuid: ticket_status_uuid },
    });

    if (!findStatus) {
      throw new CustomHttpError("ticket status not found", 404);
    }

    whereClause = {
      ...whereClause,
      ticket_status_id: findStatus.id,
    };
  }

  if (area_uuid) {
    const findArea = await areaModel.findOne({
      where: { uuid: area_uuid },
    });

    if (!findArea) {
      throw new CustomHttpError("area not found", 404);
    }

    whereClause = {
      ...whereClause,
      area_id: findArea.id,
    };
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 0;

  const offset = (page - 1) * limit;

  const ticket = await ticketModel.findAndCountAll({
    where: whereClause,
    include: [
      { model: customerModel, attributes: ["uuid", "name"] },
      { model: areaModel, attributes: ["uuid", "name"] },
      { model: ticketStatusModel, attributes: ["uuid", "name", "code"] },
      { model: ticketAccessModel, attributes: ["uuid", "name"] },
      { model: ticketCategoryModel, attributes: ["uuid", "name"] },
      { model: userModel, attributes: ["uuid", "name"], as: "executor" },
      { model: userModel, attributes: ["uuid", "name"], as: "user" },
    ],
    offset,
    limit,
  });

  const pages = Math.ceil(parseInt(ticket.count) / limit);

  //general report

  let general_report = {
    1: { name: "Draft", count: 0 },
    2: { name: "On The Way", count: 0 },
    3: { name: "Analizy", count: 0 },
    4: { name: "Handling Activity", count: 0 },
    5: { name: "Done", count: 0 },
    6: { name: "Canceled", count: 0 },
    7: { name: "All", count: 0 },
  };

  const allTicket = await ticketModel.findAll({
    where: {
      executor_id: req.user.id,
      is_active: true,
    },
    include: [
      {
        model: ticketStatusModel,
        attributes: { exclude: ["id", "createdAt", "updatedAt"] },
      },
    ],
  });

  const ticket_status = await ticketStatusModel.findAll();

  if (allTicket.length > 0) {
    allTicket.forEach((element) => {
      general_report[element.ticket_status.code].count += 1;
      general_report[7].count += 1;
    });
  }

  return res.status(200).json({
    success: true,
    message: "Ticket data retrieved successfully",
    data: ticket.rows,
    meta: {
      total: ticket.count,
      page,
      limit,
      pages,
    },
    general_report: general_report,
    ticket_status,
    user: req.user,
  });
};

const getDataTableCustomer = async (req, res) => {
  const { search, ticket_status_uuid, area_uuid } = req.query;

  let whereClause = {};

  whereClause = {
    ...whereClause,
    user_id: req.user.id,
  };

  if (search) {
    whereClause = {
      ...whereClause,
      [Op.or]: [
        { display_name: { [Op.like]: `%${search}%` } },
        { subject: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { network_number: { [Op.like]: `%${search}%` } },
        { address: { [Op.like]: `%${search}%` } },
        { case_number: { [Op.like]: `%${search}%` } },
      ],
    };
  }

  if (ticket_status_uuid) {
    const findStatus = await ticketStatusModel.findOne({
      where: { uuid: ticket_status_uuid },
    });

    if (!findStatus) {
      throw new CustomHttpError("ticket status not found", 404);
    }

    whereClause = {
      ...whereClause,
      ticket_status_id: findStatus.id,
    };
  }

  if (area_uuid) {
    const findArea = await areaModel.findOne({
      where: { uuid: area_uuid },
    });

    if (!findArea) {
      throw new CustomHttpError("area not found", 404);
    }

    whereClause = {
      ...whereClause,
      area_id: findArea.id,
    };
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 0;

  const offset = (page - 1) * limit;

  const ticket = await ticketModel.findAndCountAll({
    where: whereClause,
    include: [
      { model: customerModel, attributes: ["uuid", "name"] },
      { model: areaModel, attributes: ["uuid", "name"] },
      { model: ticketStatusModel, attributes: ["uuid", "name", "code"] },
      { model: ticketAccessModel, attributes: ["uuid", "name"] },
      { model: ticketCategoryModel, attributes: ["uuid", "name"] },
      { model: userModel, attributes: ["uuid", "name"], as: "executor" },
      { model: userModel, attributes: ["uuid", "name"], as: "user" },
    ],
    offset,
    limit,
  });

  const pages = Math.ceil(parseInt(ticket.count) / limit);

  //general report

  let general_report = {
    1: { name: "Draft", count: 0 },
    2: { name: "On The Way", count: 0 },
    3: { name: "Analizy", count: 0 },
    4: { name: "Handling Activity", count: 0 },
    5: { name: "Done", count: 0 },
    6: { name: "Canceled", count: 0 },
    7: { name: "All", count: 0 },
  };

  const allTicket = await ticketModel.findAll({
    where: {
      user_id: req.user.id,
      is_active: true,
    },
    include: [
      {
        model: ticketStatusModel,
        attributes: { exclude: ["id", "createdAt", "updatedAt"] },
      },
    ],
  });

  const ticket_status = await ticketStatusModel.findAll();

  if (allTicket.length > 0) {
    allTicket.forEach((element) => {
      general_report[element.ticket_status.code].count += 1;
      general_report[7].count += 1;
    });
  }

  return res.status(200).json({
    success: true,
    message: "Ticket data retrieved successfully",
    data: ticket.rows,
    meta: {
      total: ticket.count,
      page,
      limit,
      pages,
    },
    general_report: general_report,
    ticket_status,
    user: req.user,
  });
};

const createData = async (req, res) => {
  const {
    user_uuid,
    subject,
    description,
    customer_uuid,
    network_number,
    address,
    case_number,
    executor_uuid,
    ticket_category_uuid,
    ticket_status_uuid,
    ticket_access_uuid,
    area_uuid,
    eta,
    pic,
    pic_phone_number,
    lat,
    lng,
    gmap,
    priority_level,
  } = req.body;

  let code = "T";

  let number = null;

  const date = new Date();
  const year = date.getFullYear();

  const findTicket = await ticketModel.findAll({
    limit: 1,
    where: {
      year,
    },
    order: [["createdAt", "DESC"]],
  });

  if (findTicket.length > 0) {
    number = Number(findTicket[0].number) + 1;
  } else {
    number = 1;
  }

  const display_name = `${code}${number.toString().padStart(4, "0")}${year}`;

  let user_id = null;

  if (user_uuid) {
    const find = await userModel.findOne({
      where: {
        uuid: user_uuid,
      },
    });

    if (find === null) {
      throw new CustomHttpError("user not found", 404);
    } else {
      user_id = find.id;
    }
  }

  let customer_id = null;

  if (customer_uuid) {
    const find = await customerModel.findOne({
      where: {
        uuid: customer_uuid,
      },
    });

    if (find === null) {
      throw new CustomHttpError(`customer not found ${customer_uuid}`, 404);
    } else {
      customer_id = find.id;
    }
  }

  let executor_id = null;

  if (executor_uuid) {
    const find = await userModel.findOne({
      where: {
        uuid: executor_uuid,
      },
    });

    if (find === null) {
      throw new CustomHttpError("executor not found", 404);
    } else {
      executor_id = find.id;
    }
  }

  let ticket_category_id = null;

  if (ticket_category_uuid) {
    const find = await ticketCategoryModel.findOne({
      where: {
        uuid: ticket_category_uuid,
      },
    });

    if (find === null) {
      throw new CustomHttpError("ticket category not found", 404);
    } else {
      ticket_category_id = find.id;
    }
  }

  let ticket_status_id = 1;

  if (ticket_status_uuid) {
    const find = await ticketStatusModel.findOne({
      where: {
        uuid: ticket_status_uuid,
      },
    });

    if (find === null) {
      throw new CustomHttpError("ticket status not found", 404);
    } else {
      ticket_status_id = find.id;
    }
  }

  let ticket_access_id = null;

  if (ticket_access_uuid) {
    const find = await ticketAccessModel.findOne({
      where: {
        uuid: ticket_access_uuid,
      },
    });

    if (find === null) {
      throw new CustomHttpError("ticket access not found", 404);
    } else {
      ticket_access_id = find.id;
    }
  }

  let area_id = null;

  if (area_uuid) {
    const find = await areaModel.findOne({
      where: {
        uuid: area_uuid,
      },
    });

    if (find === null) {
      throw new CustomHttpError("area not found", 404);
    } else {
      area_id = find.id;
    }
  }

  const ticket = await ticketModel.create({
    code,
    number,
    year,
    display_name,
    user_id,
    subject,
    description,
    customer_id,
    network_number,
    address,
    case_number,
    executor_id,
    ticket_category_id,
    ticket_status_id,
    ticket_access_id,
    area_id,
    eta,
    pic,
    pic_phone_number,
    lat,
    lng,
    gmap,
    priority_level,
  });

  const description_history = `Ticket ${ticket.display_name} created by user ${user_id}`;

  await createTicketHistory(ticket.id, user_id, description_history);

  const getDate = Date.now();
  const getMinutes = new Date(getDate).getMinutes();

  const schedule_reminder = new Date(getDate);
  schedule_reminder.setMinutes(getMinutes + 5);

  await createTicketActivity({
    ticket_id: ticket.id,
    user_id,
    description: "",
    ticket_status_id,
    reminder: true,
    schedule_reminder: schedule_reminder,
  });

  return res.status(201).json({
    success: true,
    message: "success",
    data: {
      ticket,
    },
  });
};

const updateData = async (req, res) => {
  const { uuid } = req.params;
  const {
    user_uuid,
    subject,
    description,
    customer_uuid,
    network_number,
    address,
    case_number,
    executor_uuid,
    ticket_category_uuid,
    ticket_status_uuid,
    ticket_access_uuid,
    area_uuid,
    eta,
    pic,
    pic_phone_number,
    lat,
    lng,
    gmap,
    priority_level,
  } = req.body;

  const findTicket = await ticketModel.findOne({
    where: {
      uuid,
    },
  });

  let user_id = null;

  if (user_uuid) {
    const find = await userModel.findOne({
      where: {
        uuid: user_uuid,
      },
    });

    if (find === null) {
      throw new CustomHttpError("user not found", 404);
    } else {
      user_id = find.id;
    }
  }

  let customer_id = null;

  if (customer_uuid) {
    const find = await customerModel.findOne({
      where: {
        uuid: customer_uuid,
      },
    });

    if (find === null) {
      throw new CustomHttpError(`customer not found ${customer_uuid}`, 404);
    } else {
      customer_id = find.id;
    }
  }

  let executor_id = null;

  if (executor_uuid) {
    const find = await userModel.findOne({
      where: {
        uuid: executor_uuid,
      },
    });

    if (find === null) {
      throw new CustomHttpError("executor not found", 404);
    } else {
      executor_id = find.id;
    }
  }

  let ticket_category_id = null;

  if (ticket_category_uuid) {
    const find = await ticketCategoryModel.findOne({
      where: {
        uuid: ticket_category_uuid,
      },
    });

    if (find === null) {
      throw new CustomHttpError("ticket category not found", 404);
    } else {
      ticket_category_id = find.id;
    }
  }

  let ticket_status_id = null;

  if (ticket_status_uuid) {
    const find = await ticketStatusModel.findOne({
      where: {
        uuid: ticket_status_uuid,
      },
    });

    if (find === null) {
      throw new CustomHttpError("ticket status not found", 404);
    } else {
      ticket_status_id = find.id;
    }
  }

  let ticket_access_id = null;

  if (ticket_access_uuid) {
    const find = await ticketAccessModel.findOne({
      where: {
        uuid: ticket_access_uuid,
      },
    });

    if (find === null) {
      throw new CustomHttpError("ticket access not found", 404);
    } else {
      ticket_access_id = find.id;
    }
  }

  let area_id = null;

  if (area_uuid) {
    const find = await areaModel.findOne({
      where: {
        uuid: area_uuid,
      },
    });

    if (find === null) {
      throw new CustomHttpError("area not found", 404);
    } else {
      area_id = find.id;
    }
  }

  const ticket = await findTicket.update({
    user_id,
    subject,
    description,
    customer_id,
    network_number,
    address,
    case_number,
    executor_id,
    ticket_category_id,
    ticket_access_id,
    area_id,
    eta,
    pic,
    pic_phone_number,
    lat,
    lng,
    gmap,
    priority_level,
  });

  const description_history = `Ticket ${ticket.display_name} created by user ${user_id}`;

  await createTicketHistory(ticket.id, user_id, description_history);

  return res.status(201).json({
    success: true,
    message: "success",
    data: {
      ticket,
    },
  });
};

const getCreateDataAttribute = async (req, res) => {
  const location = await locationModel.findAll();
  const area = await areaModel.findAll();
  const ticket_access = await ticketAccessModel.findAll();
  const ticket_category = await ticketCategoryModel.findAll();
  const ticket_status = await ticketStatusModel.findAll();
  const customer = await customerModel.findAll();
  const executor = await userModel.findAll({
    where: {
      is_executor: true,
    },
  });
  const user_customer = await userModel.findAll({
    where: {
      is_customer: true,
    },
  });

  return res.status(200).json({
    success: true,
    message: "success",
    data: {
      location,
      area,
      ticket_access,
      ticket_category,
      ticket_status,
      executor,
      customer,
      user_customer,
    },
  });
};

const getEditDataAttribute = async (req, res) => {
  const { uuid } = req.params;

  const find_ticket = await ticketModel.findOne({
    where: { uuid },
    include: [
      { model: customerModel, attributes: ["uuid", "name"] },
      { model: areaModel, attributes: ["uuid", "name"] },
      { model: ticketStatusModel, attributes: ["uuid", "name", "code"] },
      { model: ticketAccessModel, attributes: ["uuid", "name"] },
      { model: ticketCategoryModel, attributes: ["uuid", "name"] },
      { model: userModel, attributes: ["uuid", "name"], as: "executor" },
      {
        model: userModel,
        attributes: ["uuid", "name"],
        as: "user",
        include: [
          {
            model: privilegeModel,
            attributes: { exclude: ["id"] },
          },
        ],
      },
      {
        model: ticketUserReminderModel,
        include: [
          {
            model: userModel,
            attributes: ["uuid", "name", "email", "phone_number"],
          },
        ],
      },
      {
        model: ticketActivityModel,
        attributes: ["uuid", "description", "reminder", "schedule_reminder"],
        include: [
          {
            model: ticketStatusModel,
            attributes: ["uuid", "name", "code"],
          },
          {
            model: ticketActivityAttachmentModel,
            attributes: ["uuid", "name", "file_url", "file_name", "file_type"],
          },
          {
            model: ticketActivityCommentModel,
            attributes: ["uuid", "description", "is_active"],
          },
        ],
      },
      {
        model: ticketHistoryModel,
        include: [{ model: userModel, attributes: ["uuid", "name"] }],
      },
      {
        model: ticketAttachmentModel,
        attributes: [
          "uuid",
          "name",
          "file_url",
          "file_name",
          "file_type",
          "description",
        ],
      },
    ],
    attributes: { exclude: ["id"] },
  });
  const location = await locationModel.findAll();
  const area = await areaModel.findAll();
  const ticket_access = await ticketAccessModel.findAll();
  const ticket_category = await ticketCategoryModel.findAll();
  const ticket_status = await ticketStatusModel.findAll();
  const customer = await customerModel.findAll();
  const executor = await userModel.findAll({
    where: {
      is_executor: true,
    },
  });
  const user_customer = await userModel.findAll({
    where: {
      is_customer: true,
    },
  });

  return res.status(200).json({
    success: true,
    message: "success",
    data: {
      ticket: find_ticket,
      location,
      area,
      ticket_access,
      ticket_category,
      ticket_status,
      executor,
      customer,
      user_customer,
    },
  });
};

const getDataById = async (req, res) => {
  const { uuid } = req.params;

  const findData = await ticketModel.findOne({
    where: { uuid },
    include: [
      { model: customerModel, attributes: ["uuid", "name"] },
      { model: areaModel, attributes: ["uuid", "name"] },
      { model: ticketStatusModel, attributes: ["uuid", "name", "code"] },
      { model: ticketAccessModel, attributes: ["uuid", "name"] },
      { model: ticketCategoryModel, attributes: ["uuid", "name"] },
      { model: userModel, attributes: ["uuid", "name"], as: "executor" },
      {
        model: userModel,
        attributes: ["uuid", "name"],
        as: "user",
        include: [
          {
            model: privilegeModel,
            attributes: { exclude: ["id"] },
          },
        ],
      },
      {
        model: ticketUserReminderModel,
        include: [
          {
            model: userModel,
            attributes: ["uuid", "name", "email", "phone_number"],
          },
        ],
      },
      {
        model: ticketActivityModel,
        attributes: ["uuid", "description", "reminder", "schedule_reminder"],
        include: [
          {
            model: ticketStatusModel,
            attributes: ["uuid", "name", "code"],
          },
          {
            model: ticketActivityAttachmentModel,
            attributes: ["uuid", "name", "file_url", "file_name", "file_type"],
          },
          {
            model: ticketActivityCommentModel,
            attributes: ["uuid", "description", "is_active"],
          },
        ],
      },
      {
        model: ticketHistoryModel,
        include: [{ model: userModel, attributes: ["uuid", "name"] }],
      },
      {
        model: ticketAttachmentModel,
        attributes: [
          "uuid",
          "name",
          "file_url",
          "file_name",
          "file_type",
          "description",
        ],
      },
    ],
    order: [
      [ticketHistoryModel, "createdAt", "DESC"],
      [ticketActivityModel, "createdAt", "ASC"],
      [ticketAttachmentModel, "createdAt", "ASC"],
    ],
  });

  const ticket_status = await ticketStatusModel.findAll();

  const users = await userModel.findAll({
    where: {
      is_active: true,
      user_status_id: 2,
    },
    attributes: ["uuid", "name", "email", "phone_number"],
  });

  if (!findData) {
    throw new CustomHttpError("data not found", 404);
  }

  return res.status(200).json({
    success: true,
    message: "success",
    data: {
      ticket: findData,
      ticket_status,
      users,
      user: req.user,
    },
  });
};

const updateStatusDataById = async (req, res) => {
  const { uuid } = req.params;
  const { ticket_status_uuid } = req.body;

  const findData = await ticketModel.findOne({ where: { uuid } });

  if (!findData) {
    throw new CustomHttpError("data not found", 404);
  }

  const findStatus = await ticketStatusModel.findOne({
    where: { uuid: ticket_status_uuid },
  });

  if (!findStatus) {
    throw new CustomHttpError("ticket status not found", 404);
  }

  findData.ticket_status_id = findStatus.id;

  await findData.save();

  const getDate = Date.now();
  const getMinutes = new Date(getDate).getMinutes();

  const schedule_reminder = new Date(getDate);
  const time = findStatus.time;
  schedule_reminder.setMinutes(getMinutes + Number(time));

  await createTicketActivity({
    ticket_id: findData.id,
    user_id: req.user.id,
    ticket_status_id: findStatus.id,
    description: `Ticket status updated to ${findStatus.name}`,
    reminder: true,
    schedule_reminder: schedule_reminder,
  });

  await createTicketHistory(
    findData.id,
    req.user.id,
    `Ticket status updated to ${findStatus.name} and create ticket activity ${findStatus.name}`
  );

  return res.status(200).json({
    success: true,
    message: "success",
    data: {
      ticket: findData,
    },
  });
};

module.exports = {
  getCreateDataAttribute,
  createData,
  updateData,
  updateStatusDataById,
  getDataById,
  getDataTable,
  getDataTableExecutor,
  getDataTableCustomer,
  getEditDataAttribute,
};
