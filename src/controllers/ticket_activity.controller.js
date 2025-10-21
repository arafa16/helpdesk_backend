const {
  ticket: ticketModel,
  ticket_activity: ticketActivityModel,
  ticket_status: ticketStatusModel,
} = require("../models");
const CustomHttpError = require("../utils/custom_http_error.js");
const {
  createTicketHistory,
} = require("../controllers/ticket_history.controller.js");

const updateData = async (req, res) => {
  const { uuid } = req.params;
  const { description, reminder, schedule_reminder, ticket_status_uuid } =
    req.body;

  const findData = await ticketActivityModel.findOne({ where: { uuid } });

  if (!findData) {
    throw new CustomHttpError("data not found", 404);
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

  await ticketActivityModel.update(
    {
      description,
      reminder,
      schedule_reminder,
      ticket_status_id,
    },
    {
      where: { uuid },
    }
  );

  return res.status(200).json({
    success: true,
    message: "data updated successfully",
  });
};

const deleteData = async (req, res) => {
  const { uuid } = req.params;

  // Check if the ticket activity exists
  const ticketActivity = await ticketActivityModel.findOne({ where: { uuid } });

  if (!ticketActivity) {
    throw new CustomHttpError("Ticket activity not found", 404);
  }

  const ticket_id = ticketActivity.ticket_id;
  const user_id = req.user.id;
  const message = `${req.user.name} deleted a ticket activity`;

  // Delete the ticket activity
  await ticketActivity.destroy();

  // Create a ticket history entry
  await createTicketHistory(ticket_id, user_id, message);

  return res.status(201).json({
    success: true,
    message: "data deleted successfully",
  });
};

module.exports = {
  deleteData,
  updateData,
};
