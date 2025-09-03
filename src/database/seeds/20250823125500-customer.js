"use strict";
const uuid = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert("customers", [
      {
        id: 1,
        uuid: uuid.v4(),
        name: "Toyota Astra Motor",
        address:
          "Jln proklamasi no.35 Lantai 1, RT.11 RW.02, Pegangsaan, Kec. Menteng, Jakarta Pusat",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    queryInterface.bulkDelete("customers", null, {});
  },
};
