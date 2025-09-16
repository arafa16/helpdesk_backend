"use strict";
const uuid = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert("job_positions", [
      {
        id: 1,
        uuid: uuid.v4(),
        name: "Admin",
        sequence: 1,
        code: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        uuid: uuid.v4(),
        name: "Teknisi",
        sequence: 2,
        code: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 3,
        uuid: uuid.v4(),
        name: "Coordinator",
        sequence: 3,
        code: 3,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 4,
        uuid: uuid.v4(),
        name: "SPV",
        sequence: 4,
        code: 4,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 5,
        uuid: uuid.v4(),
        name: "Ass. Manager",
        sequence: 5,
        code: 5,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 6,
        uuid: uuid.v4(),
        name: "Manager",
        sequence: 6,
        code: 6,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 7,
        uuid: uuid.v4(),
        name: "Direksi",
        sequence: 7,
        code: 7,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    queryInterface.bulkDelete("job_positions", null, {});
  },
};
