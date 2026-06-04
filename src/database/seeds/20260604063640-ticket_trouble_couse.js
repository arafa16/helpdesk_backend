"use strict";
const uuid = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const problemCauses = [
      "CLOSURE HILANG",
      "CLOSURE RUSAK",
      "COOPLRE RUSAK (DI ODP,OTB & XCC)",
      "CORE BENDING",
      "CORE GETAS",
      "CORE PUTUS",
      "KABEL LUKA",
      "KABEL PUTUS",
      "MODEM HANG",
      "MODEM MATI TOTALL",
      "ODP HILANG",
      "ODP RUSAK",
      "PASSIVE SPLITTER RUSAK",
      "PERANGKAT MODEM MATI TOTAL",
      "PIGTAIL RUSAK",
      "SFP RUSAK",
      "TIANG HILANG",
      "XCC RUSAK",
    ];

    const records = [];
    problemCauses.forEach((cause, index) => {
      records.push({
        id: index + 1,
        uuid: uuid.v4(),
        name: cause,
        sequence: index + 1,
        code: index + 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      });
    });

    return queryInterface.bulkInsert("ticket_trouble_couses", records);
  },

  async down(queryInterface, Sequelize) {
    queryInterface.bulkDelete("ticket_trouble_couses", null, {});
  },
};
