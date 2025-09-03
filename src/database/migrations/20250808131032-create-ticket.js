"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("tickets", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      uuid: {
        type: Sequelize.STRING,
      },
      code: {
        type: Sequelize.STRING,
      },
      number: {
        type: Sequelize.DECIMAL,
      },
      year: {
        type: Sequelize.DECIMAL,
      },
      display_name: {
        type: Sequelize.STRING,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      subject: {
        type: Sequelize.TEXT,
      },
      description: {
        type: Sequelize.TEXT,
      },
      customer_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      network_number: {
        type: Sequelize.TEXT,
      },
      address: {
        type: Sequelize.TEXT,
      },
      case_number: {
        type: Sequelize.TEXT,
      },
      executor_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      ticket_category_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      ticket_status_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      ticket_access_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      area_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      eta: {
        type: Sequelize.DECIMAL,
      },
      pic: {
        type: Sequelize.STRING,
      },
      pic_phone_number: {
        type: Sequelize.TEXT,
      },
      lat: {
        type: Sequelize.TEXT,
      },
      lng: {
        type: Sequelize.TEXT,
      },
      gmap: {
        type: Sequelize.TEXT,
      },
      priority_level: {
        type: Sequelize.ENUM("low", "medium", "high", "urgent"),
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
    await queryInterface.dropTable("tickets");
  },
};
