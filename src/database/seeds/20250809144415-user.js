"use strict";
const argon = require("argon2");
const uuid = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert("users", [
      {
        id: 1,
        uuid: uuid.v4(),
        name: "admin",
        email: "admin@gmail.com",
        password: await argon.hash("admin"),
        user_status_id: 2,
        is_executor: true,
        is_customer: true,
        privilege_id: 1,
        company_id: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        uuid: uuid.v4(),
        name: "user",
        email: "user@gmail.com",
        password: await argon.hash("user"),
        user_status_id: 2,
        is_executor: true,
        is_customer: true,
        privilege_id: 1,
        company_id: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    queryInterface.bulkDelete("users", null, {});
  },
};
