const CustomHttpError = require("../utils/custom_http_error.js");
const {
  ticket_activity: ticketActivityModel,
  ticket_activity_comment: ticketActivityCommentModel,
  ticket_activity_comment_attachment: ticketActivityCommentAttachmentModel,
} = require("../models/index.js");
const path = require("path");
const crypto = require("crypto");

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

    //create attachment if file is provided
    if (req.files && req.files.file !== undefined) {
      const file = req.files.file;
      const file_size = file.data.length;
      const file_type = file.mimetype;
      const ext = path.extname(file.name);
      const rename = req.body.name + (ext ? ext : "") || file.name;
      const file_name = crypto.randomUUID() + ext;
      const file_url = `/attributes/attachments/ticket_activity_comment/${file_name}`;

      if (file_size > 50000000) {
        return res.status(422).json({ msg: "Image must be less than 50 MB" });
      }
      file.mv(
        `./public/attributes/attachments/ticket_activity_comment/${file_name}`,
        async (err) => {
          if (err) return res.status(500).json({ message: err.message });
          await ticketActivityCommentAttachmentModel.create({
            ticket_activity_comment_id: newComment.id,
            name: rename,
            file_name,
            file_url,
            file_type,
          });
        }
      );
    }

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
