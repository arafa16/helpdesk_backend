const errorHandlerMiddleware = require("../middleware/error_handler.js");
const {
  ticket_activity: ticketActivityModel,
  ticket_activity_comment: ticketActivityCommentModel,
} = require("../models/index.js");

const createData = async (req, res) => {
  const { ticket_activity_uuid, description, is_active } = req.body;

  const findTicketActivity = await ticketActivityModel.findOne({
    where: {
      uuid: ticket_activity_uuid,
    },
  });

  if (!findTicketActivity) {
    throw new CustomHttpError("ticket activity not found", 404);
  }

  try {
    const newComment = await ticketActivityCommentModel.create({
      ticket_activity_id: findTicketActivity.id,
      description,
      is_active,
    });

    return res.status(201).json({
      success: true,
      message: "Ticket activity comment created successfully",
      data: newComment,
    });
  } catch (error) {
    console.error("Error creating ticket activity comment:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const deleteData = async (req, res) => {
  const { uuid } = req.params;

  const ticketActivityComment = await ticketActivityCommentModel.findOne({
    where: { uuid },
  });

  if (!ticketActivityComment) {
    return res
      .status(404)
      .json({ message: "Ticket activity comment not found" });
  }

  try {
    await ticketActivityCommentModel.destroy({
      where: { uuid },
    });

    return res.status(200).json({
      message: "Ticket activity comment deleted successfully",
      data: null,
    });
  } catch (error) {
    console.error("Error deleting ticket activity comment:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createData,
  deleteData,
};
