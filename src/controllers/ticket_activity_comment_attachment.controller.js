const {
  ticket_activity_comment_attachment: ticketActivityCommentAttachmentModel,
  ticket_activity_comment: ticketActivityCommentModel,
  ticket_activity: ticketActivityModel,
} = require("../models/index.js");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");
const CustomHttpError = require("../utils/custom_http_error.js");
const { createTicketHistory } = require("./ticket_history.controller.js");

const createData = async (req, res) => {
  const { uuid } = req.params;
  const { name } = req.body;

  if (!uuid) {
    return res
      .status(422)
      .json({ message: "Ticket Activity Comment UUID is required" });
  }

  const ticket_activity_comment = await ticketActivityCommentModel.findOne({
    where: {
      uuid: uuid,
    },
  });

  if (!ticket_activity_comment) {
    throw new CustomHttpError("ticket activity comment not found", 404);
  }

  if (!req.files.file || req.files.file.length === 0) {
    throw new CustomHttpError("No File Uploaded", 401);
  }

  const file = req.files.file;
  const file_size = file.data.length;
  const file_type = file.mimetype;

  const ext = path.extname(file.name);
  const rename = name ? name + ext : file.name;
  const file_name = crypto.randomUUID() + ext;
  const file_url = `/attributes/attachments/ticket_activity_comment/${file_name}`;

  if (file_size > 50000000) {
    return res.status(422).json({ msg: "Image must be less than 50 MB" });
  }

  file.mv(
    `./public/attributes/attachments/ticket_activity_comment/${file_name}`,
    async (err) => {
      if (err) return res.status(500).json({ message: err.message });
      try {
        await ticketActivityCommentAttachmentModel.create({
          ticket_activity_comment_id: ticket_activity_comment.id,
          name: rename,
          file_name,
          file_url,
          file_type,
        });

        const description_history = `${file.name} uploaded to ticket activity comment`;
        await createTicketHistory(
          ticket_activity_comment.ticket_activity_id,
          req.user.id,
          description_history
        );

        res.status(201).json({ message: "File Uploaded Successfully" });
      } catch (error) {
        return res.status(500).json({ message: error.message });
      }
    }
  );
};

const deleteData = async (req, res) => {
  const { uuid } = req.params;

  if (!uuid) {
    return res
      .status(422)
      .json({ message: "Ticket Activity UUID is required" });
  }

  const ticket_activity_comment_attachment =
    await ticketActivityCommentAttachmentModel.findOne({
      where: {
        uuid: uuid,
      },
    });

  if (!ticket_activity_comment_attachment) {
    throw new CustomHttpError(
      "ticket activity comment attachment not found",
      404
    );
  }

  try {
    fs.unlinkSync(`./public${ticket_activity_comment_attachment.file_url}`);

    await ticket_activity_comment_attachment.destroy();
    res.status(200).json({ message: "File Deleted Successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createData,
  deleteData,
};
