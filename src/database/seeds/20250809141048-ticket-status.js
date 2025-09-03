"use strict";
const uuid = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert("ticket_statuses", [
      {
        id: 1,
        uuid: uuid.v4(),
        name: "draft",
        sequence: 1,
        code: 1,
        time: 5,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        uuid: uuid.v4(),
        name: "on the way",
        sequence: 2,
        code: 2,
        time: 60,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 3,
        uuid: uuid.v4(),
        name: "analyze",
        sequence: 3,
        code: 3,
        time: 60,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 4,
        uuid: uuid.v4(),
        name: "handling activities",
        sequence: 4,
        code: 4,
        time: 180,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 5,
        uuid: uuid.v4(),
        name: "done",
        sequence: 5,
        code: 5,
        time: 0,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 6,
        uuid: uuid.v4(),
        name: "canceled",
        sequence: 6,
        code: 6,
        time: 0,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    queryInterface.bulkDelete("ticket_statuses", null, {});
  },
};
