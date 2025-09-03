const {
  ticket_activity: ticketActivityModel,
  ticket_activity_attachment: ticketActivityAttachmentModel,
  ticket_status: ticketStatusModel,
} = require("../models/index.js");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");
const CustomHttpError = require("../utils/custom_http_error.js");
const { createTicketHistory } = require("./ticket_history.controller.js");

const createData = async (req, res) => {
  const { uuid } = req.params;

  console.log(uuid, "uuid");

  if (!uuid) {
    return res
      .status(422)
      .json({ message: "Ticket Activity UUID is required" });
  }

  const ticket_activity = await ticketActivityModel.findOne({
    where: {
      uuid: uuid,
    },
  });

  if (!ticket_activity) {
    throw new CustomHttpError("ticket activity not found", 404);
  }

  if (!req.files.file || req.files.file.length === 0) {
    throw new CustomHttpError("No File Uploaded", 401);
  }

  const file = req.files.file;
  const file_size = file.data.length;
  const file_type = file.mimetype;

  const ext = path.extname(file.name);
  const file_name = crypto.randomUUID() + ext;
  const file_url = `/attributes/attachments/ticket_activity/${file_name}`;

  if (file_size > 50000000) {
    return res.status(422).json({ msg: "Image must be less than 50 MB" });
  }

  file.mv(
    `./public/attributes/attachments/ticket_activity/${file_name}`,
    async (err) => {
      if (err) return res.status(500).json({ message: err.message });
      try {
        await ticketActivityAttachmentModel.create({
          ticket_activity_id: ticket_activity.id,
          name: file.name,
          file_name,
          file_url,
          file_type,
        });

        const description_history = `File ${file.name} uploaded to ticket activity ${ticket_activity.name}`;

        await createTicketHistory(
          ticket_activity.ticket_id,
          req.user.id,
          description_history
        );

        return res.status(201).json({ message: "file uploaded" });
      } catch (error) {
        return res.status(500).json({ message: error.message });
      }
    }
  );
};

const deleteData = async (req, res) => {
  const { uuid } = req.params;

  const ticketActivityAttachment = await ticketActivityAttachmentModel.findOne({
    where: {
      uuid,
    },
  });

  if (!ticketActivityAttachment) {
    return res.status(404).json({
      message: "ticket activity attachment not found",
    });
  }

  try {
    const ticket_activity = await ticketActivityModel.findOne({
      where: {
        id: ticketActivityAttachment.ticket_activity_id,
      },
      include: [{ model: ticketStatusModel }],
    });

    const description_history = `File ${ticketActivityAttachment.name} delete from ticket activity ${ticket_activity?.ticket_status?.name}`;

    await createTicketHistory(
      ticket_activity.ticket_id,
      req.user.id,
      description_history
    );

    fs.unlinkSync(`./public${ticketActivityAttachment.file_url}`);

    await ticketActivityAttachment.destroy({
      where: {
        uuid,
      },
    });

    return res.status(200).json({
      message: "ticket activity attachment deleted",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createData,
  deleteData,
};
