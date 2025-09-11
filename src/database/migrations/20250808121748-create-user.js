"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      uuid: {
        type: Sequelize.STRING,
      },
      name: {
        type: Sequelize.STRING,
      },
      nip: {
        type: Sequelize.STRING,
      },
      email: {
        type: Sequelize.STRING,
      },
      password: {
        type: Sequelize.STRING,
      },
      phone_number: {
        type: Sequelize.STRING,
        defaultValue: 0,
      },
      location_id: {
        type: Sequelize.INTEGER,
      },
      division_id: {
        type: Sequelize.INTEGER,
      },
      user_status_id: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      is_executor: {
        type: Sequelize.BOOLEAN,
      },
      is_customer: {
        type: Sequelize.BOOLEAN,
      },
      company_id: {
        type: Sequelize.INTEGER,
      },
      privilege_id: {
        type: Sequelize.INTEGER,
      },
      photo_name: {
        type: Sequelize.TEXT,
        defaultValue: null,
      },
      photo_type: {
        type: Sequelize.TEXT,
        defaultValue: null,
      },
      photo_url: {
        type: Sequelize.TEXT,
        defaultValue: null,
      },
      background_name: {
        type: Sequelize.TEXT,
        defaultValue: null,
      },
      background_type: {
        type: Sequelize.TEXT,
        defaultValue: null,
      },
      background_url: {
        type: Sequelize.TEXT,
        defaultValue: null,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("users");
  },
};
