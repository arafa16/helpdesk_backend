"use strict";
const uuid = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert("ticket_trouble_categories", [
      {
        id: 1,
        uuid: uuid.v4(),
        name: "Kabel Putus",
        sequence: 1,
        code: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        uuid: uuid.v4(),
        name: "Project Pihak ke 3",
        sequence: 2,
        code: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 3,
        uuid: uuid.v4(),
        name: "Core Rusak",
        sequence: 3,
        code: 3,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 4,
        uuid: uuid.v4(),
        name: "Perangkat",
        sequence: 4,
        code: 4,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    queryInterface.bulkDelete("ticket_trouble_categories", null, {});
  },
};
