const {
  ticket: ticketModel,
  ticket_attachment: ticketAttachmentModel,
} = require("../models");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");
const CustomHttpError = require("../utils/custom_http_error.js");
const {
  createTicketHistory,
} = require("../controllers/ticket_history.controller.js");

const createData = async (req, res) => {
  const { ticket_uuid } = req.params;
  const { description } = req.body;

  if (!ticket_uuid) {
    return res.status(422).json({ message: "Ticket UUID is required" });
  }

  const ticket = await ticketModel.findOne({
    where: {
      uuid: ticket_uuid,
    },
  });

  if (!ticket) {
    throw new CustomHttpError("ticket not found", 404);
  }

  if (!req.files.file || req.files.file.length === 0) {
    throw new CustomHttpError("No File Uploaded", 401);
  }

  const file = req.files.file;
  const file_size = file.data.length;
  const file_type = file.mimetype;

  const ext = path.extname(file.name);
  const file_name = crypto.randomUUID() + ext;
  const file_url = `/attributes/attachments/ticket/${file_name}`;

  if (file_size > 50000000) {
    return res.status(422).json({ msg: "Image must be less than 50 MB" });
  }

  file.mv(
    `./public/attributes/attachments/ticket/${file_name}`,
    async (err) => {
      if (err) return res.status(500).json({ message: err.message });
      try {
        await ticketAttachmentModel.create({
          ticket_id: ticket.id,
          name: file.name,
          description,
          file_name,
          file_url,
          file_type,
        });

        const description_history = `File ${file.name} uploaded to ticket ${ticket.id}`;

        await createTicketHistory(ticket.id, req.user.id, description_history);

        return res.status(201).json({ message: "file uploaded" });
      } catch (error) {
        return res.status(500).json({ message: error.message });
      }
    }
  );
};

const deleteData = async (req, res) => {
  const { uuid } = req.params;

  const ticketAttachment = await ticketAttachmentModel.findOne({
    where: {
      uuid,
    },
  });

  if (!ticketAttachment) {
    return res.status(404).json({
      message: "ticket attachment not found",
    });
  }

  try {
    fs.unlinkSync(`./public${ticketAttachment.file_url}`);

    await ticketAttachmentModel.destroy({
      where: {
        uuid,
      },
    });

    return res.status(200).json({
      message: "ticket attachment deleted",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createData,
  deleteData,
};
