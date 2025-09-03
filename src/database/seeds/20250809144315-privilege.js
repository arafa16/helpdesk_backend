"use strict";
const uuid = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert("privileges", [
      {
        id: 1,
        uuid: uuid.v4(),
        ticket_customer: true,
        ticket_executor: true,
        ticket: true,
        user: true,
        setting: true,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    queryInterface.bulkDelete("privileges", null, {});
  },
};
