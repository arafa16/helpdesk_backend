"use strict";
const uuid = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const problemCategories = [
      "Kabel Putus",
      "AKTIVITAS PIHAK KETIGA",
      "Core Rusak",
      "Perangkat",
      "FAKTOR ALAM",
      "HEWAN PENGERAT",
      "VANDALISME",
      "TERSANGKUT KENDARAAN BESAR",
      "PERANGKAT AKTIF",
      "PERANGKAT PASIF",
      "CLOSURE",
      "KELISTRIKAN",
    ];

    const records = [];
    problemCategories.forEach((category, index) => {
      records.push({
        id: index + 1,
        uuid: uuid.v4(),
        name: category,
        sequence: index + 1,
        code: index + 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      });
    });

    return queryInterface.bulkInsert("ticket_trouble_categories", records);
  },

  async down(queryInterface, Sequelize) {
    queryInterface.bulkDelete("ticket_trouble_categories", null, {});
  },
};
