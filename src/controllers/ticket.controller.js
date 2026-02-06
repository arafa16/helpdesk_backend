const {
  ticket: ticketModel,
  location: locationModel,
  area: areaModel,
  ticket_access: ticketAccessModel,
  ticket_category: ticketCategoryModel,
  ticket_trouble_category: ticketTroubleCategoryModel,
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
  ticket_network_status: ticketNetworkStatusModel,
  ticket_activity_comment_attachment: ticketActivityCommentAttachmentModel,
  company: companyModel,
  ticket_job_position_reminder: ticketJobPositionReminderModel,
  job_position: jobPositionModel,
} = require("../models");
const CustomHttpError = require("../utils/custom_http_error.js");
const {
  createTicketHistory,
} = require("../controllers/ticket_history.controller.js");
const { Op, where } = require("sequelize");

const create_job_position_reminder = async (
  ticket_id,
  job_position_code,
  date,
) => {
  await job_position_code.map(async (code) => {
    const getHours = new Date(date).getHours();

    let schedule_reminder = null;

    if (code === 3) {
      const reminder = new Date(date);
      reminder.setHours(getHours + 3);
      schedule_reminder = reminder;
    } else if (code === 4) {
      const reminder = new Date(date);
      reminder.setHours(getHours + 4);
      schedule_reminder = reminder;
    } else if (code === 6) {
      const reminder = new Date(date);
      reminder.setHours(getHours + 5);
      schedule_reminder = reminder;
    } else if (code === 7) {
      const reminder = new Date(date);
      reminder.setHours(getHours + 6);
      schedule_reminder = reminder;
    }

    const find_position = await jobPositionModel.findOne({
      where: {
        code: code,
      },
      attributes: ["id"],
    });

    if (find_position !== null) {
      await ticketJobPositionReminderModel.create({
        ticket_id: ticket_id,
        job_position_id: find_position.id,
        reminder: true,
        schedule_reminder: schedule_reminder,
      });
    }
  });
};

const update_job_position_reminder = async (data) => {
  await ticketJobPositionReminderModel.update(
    {
      reminder: false,
      schedule_reminder: null,
    },
    {
      where: {
        ticket_id: data.ticket_id,
      },
    },
  );
};

const createTicketActivity = async (data) => {
  if (data.ticket_status_code === "5" || data.ticket_status_code === "6") {
    return await ticketActivityModel.create({
      ticket_id: data.ticket_id,
      user_id: data.user_id,
      ticket_status_id: data.ticket_status_id,
      description: data.description,
      reminder: false,
      schedule_reminder: null,
      start_date: data.start_date,
      end_date: data.start_date,
    });
  } else if (data.ticket_status_code === "7") {
    return await ticketActivityModel.create({
      ticket_id: data.ticket_id,
      user_id: data.user_id,
      ticket_status_id: data.ticket_status_id,
      description: data.description,
      reminder: false,
      schedule_reminder: null,
      start_date: data.start_date,
    });
  } else {
    return await ticketActivityModel.create({
      ticket_id: data.ticket_id,
      user_id: data.user_id,
      ticket_status_id: data.ticket_status_id,
      description: data.description,
      reminder: data.reminder,
      schedule_reminder: data.schedule_reminder,
      start_date: data.start_date,
    });
  }
};

const writeEndDateTicketActivity = async (data) => {
  const findTicketActivity = await ticketActivityModel.findOne({
    where: {
      ticket_id: data.ticket_id,
    },
    order: [["id", "DESC"]],
  });

  if (
    findTicketActivity !== null ||
    (findTicketActivity !== null && findTicketActivity.code !== "5") ||
    (findTicketActivity !== null && findTicketActivity.code !== "6")
  ) {
    findTicketActivity.schedule_reminder = null;
    findTicketActivity.reminder = false;
    findTicketActivity.end_date = data.end_date;

    return await findTicketActivity.save();
  }
};

const getDataTable = async (req, res) => {
  const { search, ticket_status_uuid, area_uuid, is_active } = req.query;

  let whereClause = {};

  if (is_active) {
    whereClause = {
      ...whereClause,
      is_active: is_active === "1" ? true : false,
    };
  } else {
    whereClause = {
      ...whereClause,
      is_active: true,
    };
  }

  if (search) {
    whereClause = {
      ...whereClause,
      [Op.or]: [
        { display_name: { [Op.like]: `%${search}%` } },
        { subject: { [Op.like]: `%${search}%` } },
        { network_number: { [Op.like]: `%${search}%` } },
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

  if (area_uuid && area_uuid !== "undefined" && area_uuid !== "null") {
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
  const limit = parseInt(req.query.limit) || 10;

  const offset = (page - 1) * limit;

  const ticket = await ticketModel.findAndCountAll({
    where: whereClause,
    include: [
      { model: customerModel, attributes: ["uuid", "name"] },
      { model: areaModel, attributes: ["uuid", "name"] },
      { model: ticketStatusModel, attributes: ["uuid", "name", "code"] },
      {
        model: ticketActivityModel,
        attributes: [
          "uuid",
          "description",
          "start_date",
          "end_date",
          "createdAt",
        ],
        include: [
          {
            model: ticketStatusModel,
            attributes: ["uuid", "name", "code", "is_active"],
          },
        ],
      },
    ],
    attributes: [
      "uuid",
      "display_name",
      "subject",
      "case_number",
      "down_time",
      "up_time",
      "complaint_time",
      "is_active",
      "createdAt",
      "updatedAt",
    ],
    offset,
    limit,
    distinct: true,
    order: [["id", "DESC"]],
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
    7: { name: "Stop Clock", count: 0 },
    8: { name: "All", count: 0 },
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

  const ticket_status = await ticketStatusModel.findAll({
    where: {
      is_active: true,
    },
  });

  const area = await areaModel.findAll({
    where: { is_active: true },
  });

  if (allTicket.length > 0) {
    allTicket.forEach((element) => {
      general_report[element.ticket_status.code].count += 1;
      general_report[8].count += 1;
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
    area,
    user: req.user,
  });
};

const getDataTableExecutor = async (req, res) => {
  const { search, ticket_status_uuid, area_uuid, is_active } = req.query;

  let whereClause = {};

  whereClause = {
    ...whereClause,
    [Op.or]: [
      { first_executor_id: req.user.id },
      { second_executor_id: req.user.id },
      { third_executor_id: req.user.id },
      { fourth_executor_id: req.user.id },
    ],
    is_active: true,
  };

  if (is_active) {
    whereClause = {
      ...whereClause,
      is_active: is_active === "1" ? true : false,
    };
  }

  if (search) {
    whereClause = {
      ...whereClause,
      [Op.or]: [
        { display_name: { [Op.like]: `%${search}%` } },
        { subject: { [Op.like]: `%${search}%` } },
        { network_number: { [Op.like]: `%${search}%` } },
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
  const limit = parseInt(req.query.limit) || 10;

  const offset = (page - 1) * limit;

  const ticket = await ticketModel.findAndCountAll({
    where: whereClause,
    include: [
      { model: customerModel, attributes: ["uuid", "name"] },
      { model: areaModel, attributes: ["uuid", "name"] },
      { model: ticketStatusModel, attributes: ["uuid", "name", "code"] },
      { model: ticketAccessModel, attributes: ["uuid", "name"] },
      { model: ticketCategoryModel, attributes: ["uuid", "name"] },
      { model: ticketTroubleCategoryModel, attributes: ["uuid", "name"] },
      { model: userModel, attributes: ["uuid", "name"], as: "first_executor" },
      { model: userModel, attributes: ["uuid", "name"], as: "second_executor" },
      { model: userModel, attributes: ["uuid", "name"], as: "third_executor" },
      { model: userModel, attributes: ["uuid", "name"], as: "fourth_executor" },
      { model: userModel, attributes: ["uuid", "name"], as: "user" },
      { model: ticketNetworkStatusModel, attributes: ["uuid", "name"] },
      {
        model: ticketActivityModel,
        attributes: { exclude: ["id"] },
        include: [
          {
            model: ticketStatusModel,
            attributes: ["uuid", "name", "code", "is_active"],
          },
        ],
      },
      { model: companyModel, attributes: ["uuid", "name"] },
    ],
    offset,
    limit,
    distinct: true,
    order: [["id", "DESC"]],
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
    7: { name: "Stop Clock", count: 0 },
    8: { name: "All", count: 0 },
  };

  const allTicket = await ticketModel.findAll({
    where: {
      [Op.or]: [
        { first_executor_id: req.user.id },
        { second_executor_id: req.user.id },
        { third_executor_id: req.user.id },
        { fourth_executor_id: req.user.id },
      ],
      is_active: true,
    },
    include: [
      {
        model: ticketStatusModel,
        attributes: { exclude: ["id", "createdAt", "updatedAt"] },
      },
    ],
  });

  const ticket_status = await ticketStatusModel.findAll({
    where: {
      is_active: true,
    },
  });

  if (allTicket.length > 0) {
    allTicket.forEach((element) => {
      general_report[element.ticket_status.code].count += 1;
      general_report[8].count += 1;
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
  const { search, ticket_status_uuid, area_uuid, is_active } = req.query;

  let whereClause = {};

  whereClause = {
    ...whereClause,
    area_id: req.user.area_id,
    company_id: req.user.company_id,
  };

  if (is_active) {
    whereClause = {
      ...whereClause,
      is_active: is_active === "1" ? true : false,
    };
  } else {
    whereClause = {
      ...whereClause,
      is_active: true,
    };
  }

  if (search) {
    whereClause = {
      ...whereClause,
      [Op.or]: [
        { display_name: { [Op.like]: `%${search}%` } },
        { subject: { [Op.like]: `%${search}%` } },
        { network_number: { [Op.like]: `%${search}%` } },
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
  const limit = parseInt(req.query.limit) || 10;

  const offset = (page - 1) * limit;

  const ticket = await ticketModel.findAndCountAll({
    where: whereClause,
    include: [
      { model: customerModel, attributes: ["uuid", "name"] },
      { model: areaModel, attributes: ["uuid", "name"] },
      { model: ticketStatusModel, attributes: ["uuid", "name", "code"] },
      { model: ticketAccessModel, attributes: ["uuid", "name"] },
      { model: ticketCategoryModel, attributes: ["uuid", "name"] },
      { model: ticketTroubleCategoryModel, attributes: ["uuid", "name"] },
      { model: userModel, attributes: ["uuid", "name"], as: "first_executor" },
      { model: userModel, attributes: ["uuid", "name"], as: "second_executor" },
      { model: userModel, attributes: ["uuid", "name"], as: "third_executor" },
      { model: userModel, attributes: ["uuid", "name"], as: "fourth_executor" },
      { model: userModel, attributes: ["uuid", "name"], as: "user" },
      { model: ticketNetworkStatusModel, attributes: ["uuid", "name"] },
      {
        model: ticketActivityModel,
        attributes: { exclude: ["id"] },
        include: [
          {
            model: ticketStatusModel,
            attributes: ["uuid", "name", "code", "is_active"],
          },
        ],
      },
      { model: companyModel, attributes: ["uuid", "name"] },
    ],
    offset,
    limit,
    distinct: true,
    order: [["id", "DESC"]],
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
    7: { name: "Stop Clock", count: 0 },
    8: { name: "All", count: 0 },
  };

  const allTicket = await ticketModel.findAll({
    where: {
      area_id: req.user.area_id,
      company_id: req.user.company_id,
      is_active: true,
    },
    include: [
      {
        model: ticketStatusModel,
        attributes: { exclude: ["id", "createdAt", "updatedAt"] },
      },
    ],
  });

  const ticket_status = await ticketStatusModel.findAll({
    where: {
      is_active: true,
    },
  });

  if (allTicket.length > 0) {
    allTicket.forEach((element) => {
      general_report[element.ticket_status.code].count += 1;
      general_report[8].count += 1;
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
    rfo,
    customer_uuid,
    network_number,
    address,
    case_number,
    first_executor_uuid,
    second_executor_uuid,
    third_executor_uuid,
    fourth_executor_uuid,
    ticket_category_uuid,
    ticket_status_uuid,
    ticket_access_uuid,
    area_uuid,
    complaint_time,
    eta,
    pic,
    pic_phone_number,
    lat,
    lng,
    gmap,
    priority_level,
    ticket_trouble_category_uuid,
    ticket_trouble_description,
    solution,
    ticket_network_status_uuid,
    down_time,
    up_time,
    new_cable,
    external_pole,
    new_pole_setup,
    open_cut,
    drilling,
    new_closure,
    new_splitter,
    fo_jointing,
    old_datek,
    new_datek,
    spk_number,
    justification,
    constraint,
    company_uuid,
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

  let first_executor_id = null;

  if (first_executor_uuid) {
    const find = await userModel.findOne({
      where: {
        uuid: first_executor_uuid,
      },
    });

    if (find === null) {
      throw new CustomHttpError("executor not found", 404);
    } else {
      first_executor_id = find.id;
    }
  }

  let second_executor_id = null;
  if (second_executor_uuid) {
    const find = await userModel.findOne({
      where: {
        uuid: second_executor_uuid,
      },
    });
    if (find === null) {
      throw new CustomHttpError("executor not found", 404);
    } else {
      second_executor_id = find.id;
    }
  }

  let third_executor_id = null;
  if (third_executor_uuid) {
    const find = await userModel.findOne({
      where: {
        uuid: third_executor_uuid,
      },
    });
    if (find === null) {
      throw new CustomHttpError("executor not found", 404);
    } else {
      third_executor_id = find.id;
    }
  }

  let fourth_executor_id = null;
  if (fourth_executor_uuid) {
    const find = await userModel.findOne({
      where: {
        uuid: fourth_executor_uuid,
      },
    });
    if (find === null) {
      throw new CustomHttpError("executor not found", 404);
    } else {
      fourth_executor_id = find.id;
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

  let ticket_trouble_category_id = null;

  if (ticket_trouble_category_uuid) {
    const find = await ticketTroubleCategoryModel.findOne({
      where: {
        uuid: ticket_trouble_category_uuid,
      },
    });

    if (find === null) {
      throw new CustomHttpError("ticket trouble category not found", 404);
    } else {
      ticket_trouble_category_id = find.id;
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

  let ticket_network_status_id = null;

  if (ticket_network_status_uuid) {
    const find = await ticketNetworkStatusModel.findOne({
      where: {
        uuid: ticket_network_status_uuid,
      },
    });

    if (find === null) {
      throw new CustomHttpError("ticket network status not found", 404);
    } else {
      ticket_network_status_id = find.id;
    }
  }

  let company_id = null;

  if (company_uuid) {
    const find = await companyModel.findOne({
      where: {
        uuid: company_uuid,
      },
    });

    if (find === null) {
      throw new CustomHttpError(`company not found ${company_uuid}`, 404);
    } else {
      company_id = find.id;
    }
  }

  const ticket = await ticketModel.create({
    code,
    number,
    year,
    display_name,
    user_id,
    subject,
    rfo,
    customer_id,
    network_number,
    address,
    case_number,
    first_executor_id,
    second_executor_id,
    third_executor_id,
    fourth_executor_id,
    ticket_category_id,
    ticket_status_id,
    ticket_access_id,
    area_id,
    complaint_time,
    eta,
    pic,
    pic_phone_number,
    lat,
    lng,
    gmap,
    priority_level,
    ticket_trouble_category_id,
    ticket_trouble_description,
    solution,
    ticket_network_status_id,
    down_time,
    up_time,
    new_cable,
    external_pole,
    new_pole_setup,
    open_cut,
    drilling,
    new_closure,
    new_splitter,
    fo_jointing,
    old_datek,
    new_datek,
    spk_number,
    justification,
    constraint,
    company_id,
  });

  const description_history = `Ticket ${ticket.display_name} created by ${req.user.name}`;

  await createTicketHistory(ticket.id, user_id, description_history);

  const getDate = Date.now();
  const getMinutes = new Date(getDate).getMinutes();

  const schedule_reminder = new Date(getDate);
  schedule_reminder.setMinutes(getMinutes + 5);

  const start_date = new Date(getDate);

  await createTicketActivity({
    ticket_id: ticket.id,
    user_id: req.user.id,
    ticket_status_id: ticket_status_id,
    ticket_status_code: 1,
    description: `Ticket created`,
    reminder: true,
    schedule_reminder: schedule_reminder,
    start_date: start_date,
  });

  const job_position_code = [3, 4, 6, 7];

  await create_job_position_reminder(ticket.id, job_position_code, getDate);

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
    rfo,
    customer_uuid,
    network_number,
    address,
    case_number,
    first_executor_uuid,
    second_executor_uuid,
    third_executor_uuid,
    fourth_executor_uuid,
    ticket_category_uuid,
    ticket_status_uuid,
    ticket_access_uuid,
    area_uuid,
    complaint_time,
    eta,
    pic,
    pic_phone_number,
    lat,
    lng,
    gmap,
    priority_level,
    ticket_trouble_category_uuid,
    ticket_trouble_description,
    solution,
    ticket_network_status_uuid,
    down_time,
    up_time,
    new_cable,
    external_pole,
    new_pole_setup,
    open_cut,
    drilling,
    new_closure,
    new_splitter,
    fo_jointing,
    old_datek,
    new_datek,
    spk_number,
    justification,
    constraint,
    company_uuid,
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

  let first_executor_id = null;

  if (first_executor_uuid) {
    const find = await userModel.findOne({
      where: {
        uuid: first_executor_uuid,
      },
    });

    if (find === null) {
      throw new CustomHttpError("executor not found", 404);
    } else {
      first_executor_id = find.id;
    }
  }

  let second_executor_id = null;
  if (second_executor_uuid) {
    const find = await userModel.findOne({
      where: {
        uuid: second_executor_uuid,
      },
    });
    if (find === null) {
      throw new CustomHttpError("executor not found", 404);
    } else {
      second_executor_id = find.id;
    }
  }

  let third_executor_id = null;
  if (third_executor_uuid) {
    const find = await userModel.findOne({
      where: {
        uuid: third_executor_uuid,
      },
    });
    if (find === null) {
      throw new CustomHttpError("executor not found", 404);
    } else {
      third_executor_id = find.id;
    }
  }

  let fourth_executor_id = null;
  if (fourth_executor_uuid) {
    const find = await userModel.findOne({
      where: {
        uuid: fourth_executor_uuid,
      },
    });
    if (find === null) {
      throw new CustomHttpError("executor not found", 404);
    } else {
      fourth_executor_id = find.id;
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

  let ticket_trouble_category_id = null;

  if (ticket_trouble_category_uuid) {
    const find = await ticketTroubleCategoryModel.findOne({
      where: {
        uuid: ticket_trouble_category_uuid,
      },
    });

    if (find === null) {
      throw new CustomHttpError("ticket trouble category not found", 404);
    } else {
      ticket_trouble_category_id = find.id;
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

  let ticket_network_status_id = null;

  if (ticket_network_status_uuid) {
    const find = await ticketNetworkStatusModel.findOne({
      where: {
        uuid: ticket_network_status_uuid,
      },
    });

    if (find === null) {
      throw new CustomHttpError("ticket network status not found", 404);
    } else {
      ticket_network_status_id = find.id;
    }
  }

  let company_id = null;

  if (company_uuid) {
    const find = await companyModel.findOne({
      where: {
        uuid: company_uuid,
      },
    });

    if (find === null) {
      throw new CustomHttpError(`company not found ${company_uuid}`, 404);
    } else {
      company_id = find.id;
    }
  }

  const ticket = await findTicket.update({
    user_id,
    subject,
    rfo,
    customer_id,
    network_number,
    address,
    case_number,
    first_executor_id,
    second_executor_id,
    third_executor_id,
    fourth_executor_id,
    ticket_category_id,
    ticket_access_id,
    area_id,
    complaint_time,
    eta,
    pic,
    pic_phone_number,
    lat,
    lng,
    gmap,
    priority_level,
    ticket_trouble_category_id,
    ticket_trouble_description,
    solution,
    ticket_network_status_id,
    down_time,
    up_time,
    new_cable,
    external_pole,
    new_pole_setup,
    open_cut,
    drilling,
    new_closure,
    new_splitter,
    fo_jointing,
    old_datek,
    new_datek,
    spk_number,
    justification,
    constraint,
    company_id,
  });

  const description_history = `Ticket ${ticket.display_name} updated by ${req.user.name}`;

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
  const location = await locationModel.findAll({
    where: { is_active: true },
  });
  const area = await areaModel.findAll({
    where: { is_active: true },
  });
  const ticket_access = await ticketAccessModel.findAll({
    where: { is_active: true },
  });
  const ticket_category = await ticketCategoryModel.findAll({
    where: { is_active: true },
  });
  const ticket_trouble_category = await ticketTroubleCategoryModel.findAll({
    where: { is_active: true },
  });
  const ticket_status = await ticketStatusModel.findAll({
    where: { is_active: true },
  });
  const customer = await customerModel.findAll({
    where: { is_active: true },
    order: [["name", "ASC"]],
  });
  const company = await companyModel.findAll({
    where: { is_active: true },
    order: [["name", "ASC"]],
  });
  const executor = await userModel.findAll({
    where: {
      is_executor: true,
      is_active: true,
    },
    order: [["name", "ASC"]],
  });
  const user_customer = await userModel.findAll({
    where: {
      is_customer: true,
      is_active: true,
    },
    order: [["name", "ASC"]],
  });
  const ticket_network_status = await ticketNetworkStatusModel.findAll({
    where: { is_active: true },
  });

  return res.status(200).json({
    success: true,
    message: "success",
    data: {
      location,
      area,
      ticket_access,
      ticket_category,
      ticket_trouble_category,
      ticket_status,
      executor,
      customer,
      user_customer,
      ticket_network_status,
      company,
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
      { model: ticketTroubleCategoryModel, attributes: ["uuid", "name"] },
      { model: userModel, attributes: ["uuid", "name"], as: "first_executor" },
      { model: userModel, attributes: ["uuid", "name"], as: "second_executor" },
      { model: userModel, attributes: ["uuid", "name"], as: "third_executor" },
      { model: userModel, attributes: ["uuid", "name"], as: "fourth_executor" },
      {
        model: ticketNetworkStatusModel,
        attributes: ["uuid", "name"],
      },
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
      {
        model: companyModel,
        attributes: ["uuid", "name"],
      },
    ],
    attributes: { exclude: ["id"] },
  });
  const location = await locationModel.findAll({
    where: { is_active: true },
  });
  const area = await areaModel.findAll({
    where: { is_active: true },
  });
  const ticket_access = await ticketAccessModel.findAll({
    where: { is_active: true },
  });
  const ticket_category = await ticketCategoryModel.findAll({
    where: { is_active: true },
  });
  const ticket_trouble_category = await ticketTroubleCategoryModel.findAll({
    where: { is_active: true },
  });
  const ticket_status = await ticketStatusModel.findAll({
    where: { is_active: true },
  });
  const customer = await customerModel.findAll({
    where: { is_active: true },
  });
  const executor = await userModel.findAll({
    where: {
      is_executor: true,
      is_active: true,
    },
    order: [["name", "ASC"]],
  });
  const user_customer = await userModel.findAll({
    where: {
      is_customer: true,
      is_active: true,
    },
    order: [["name", "ASC"]],
  });

  const ticket_network_status = await ticketNetworkStatusModel.findAll({
    where: { is_active: true },
  });

  const company = await companyModel.findAll({
    where: { is_active: true },
    order: [["name", "ASC"]],
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
      ticket_trouble_category,
      ticket_status,
      executor,
      customer,
      user_customer,
      ticket_network_status,
      company,
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
      { model: ticketTroubleCategoryModel, attributes: ["uuid", "name"] },
      { model: userModel, attributes: ["uuid", "name"], as: "first_executor" },
      { model: userModel, attributes: ["uuid", "name"], as: "second_executor" },
      { model: userModel, attributes: ["uuid", "name"], as: "third_executor" },
      { model: userModel, attributes: ["uuid", "name"], as: "fourth_executor" },
      {
        model: ticketNetworkStatusModel,
        attributes: ["uuid", "name"],
      },
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
        attributes: [
          "uuid",
          "description",
          "reminder",
          "schedule_reminder",
          "start_date",
          "end_date",
        ],
        include: [
          {
            model: ticketStatusModel,
            attributes: ["uuid", "name", "code", "is_active"],
          },
          {
            model: ticketActivityAttachmentModel,
            attributes: ["uuid", "name", "file_url", "file_name", "file_type"],
          },
          {
            model: ticketActivityCommentModel,
            attributes: ["uuid", "description", "is_active", "created_at"],
            include: [
              {
                model: ticketActivityCommentAttachmentModel,
                attributes: { exclude: ["id"] },
              },
            ],
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
      {
        model: companyModel,
        attributes: ["uuid", "name"],
      },
    ],
    order: [
      [ticketHistoryModel, "createdAt", "DESC"],
      [ticketActivityModel, "createdAt", "ASC"],
      [ticketAttachmentModel, "createdAt", "ASC"],
      [ticketActivityModel, ticketActivityCommentModel, "createdAt", "ASC"],
    ],
  });

  const ticket_status = await ticketStatusModel.findAll({
    where: { is_active: true },
  });

  const stop_clock = await ticketStatusModel.findOne({
    where: { code: "7" },
    attributes: { exclude: ["id", "createdAt", "updatedAt"] },
  });

  const cancel = await ticketStatusModel.findOne({
    where: { code: "6" },
    attributes: { exclude: ["id", "createdAt", "updatedAt"] },
  });

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
      stop_clock,
      cancel,
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

  if (
    findStatus.code === "5" ||
    findStatus.code === "6" ||
    findStatus.code === "7"
  ) {
    await update_job_position_reminder({ ticket_id: findData.id });
  }

  const getDate = Date.now();

  const getMinutes = new Date(getDate).getMinutes();

  const schedule_reminder = new Date(getDate);
  const time = findStatus.time;
  schedule_reminder.setMinutes(getMinutes + Number(time));

  const start_date = new Date(getDate);

  await writeEndDateTicketActivity({
    ticket_id: findData.id,
    end_date: start_date,
  });

  await createTicketActivity({
    ticket_id: findData.id,
    user_id: req.user.id,
    ticket_status_id: findStatus.id,
    ticket_status_code: findStatus.code,
    description: `Ticket status updated to ${findStatus.name}`,
    reminder: true,
    schedule_reminder: schedule_reminder,
    start_date: start_date,
  });

  await createTicketHistory(
    findData.id,
    req.user.id,
    `Ticket status updated to ${findStatus.name} and create ticket activity ${findStatus.name}`,
  );

  return res.status(200).json({
    success: true,
    message: "success",
    data: {
      ticket: findData,
    },
  });
};

const deleteData = async (req, res) => {
  const { uuid } = req.params;

  const findTicket = await ticketModel.findOne({
    where: { uuid },
  });

  if (!findTicket) {
    throw new CustomHttpError("Ticket not found", 404);
  }

  await findTicket.update({ is_active: false });

  return res.status(200).json({
    success: true,
    message: "Ticket deleted successfully",
    data: null,
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
  deleteData,
};
