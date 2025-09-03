const {
  ticket_user_reminder: ticketUserReminderModel,
  ticket: ticketModel,
  user: userModel,
} = require("../models/index.js");

const CustomHttpError = require("../utils/custom_http_error.js");

const createData = async (req, res) => {
  const { ticket_uuid, user_uuid, is_active } = req.body;

  const findTicket = await ticketModel.findOne({
    where: {
      uuid: ticket_uuid,
    },
  });

  if (!findTicket) {
    throw new CustomHttpError("ticket not found", 404);
  }

  const findUser = await userModel.findOne({
    where: {
      uuid: user_uuid,
    },
  });

  if (!findUser) {
    throw new CustomHttpError("user not found", 404);
  }

  try {
    const newTicketUserReminder = await ticketUserReminderModel.create({
      ticket_id: findTicket.id,
      user_id: findUser.id,
      is_active,
    });

    return res.status(201).json({
      success: true,
      message: "Ticket user reminder created successfully",
      data: newTicketUserReminder,
    });
  } catch (error) {
    console.error("Error creating ticket user reminder:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const deleteData = async (req, res) => {
  const { uuid } = req.params;

  try {
    const deletedTicketUserReminder = await ticketUserReminderModel.destroy({
      where: {
        uuid,
      },
    });

    if (!deletedTicketUserReminder) {
      throw new CustomHttpError("Ticket user reminder not found", 404);
    }

    return res.status(200).json({
      success: true,
      message: "Ticket user reminder deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting ticket user reminder:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createData,
  deleteData,
};
