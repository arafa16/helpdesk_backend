const { ticket_history: ticketHistoryModel } = require("../models");

const createTicketHistory = async (ticket_id, user_id, description) => {
  return await ticketHistoryModel.create({
    ticket_id,
    user_id,
    description,
  });
};

module.exports = {
  createTicketHistory,
};
