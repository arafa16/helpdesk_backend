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
      rfo: {
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
      complaint_time: {
        type: Sequelize.DATE,
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
      ticket_trouble_category_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      solution: {
        type: Sequelize.TEXT,
      },
      ticket_network_status_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      down_time: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      up_time: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      new_cable: {
        type: Sequelize.DECIMAL,
        allowNull: true,
      },
      external_pole: {
        type: Sequelize.DECIMAL,
        allowNull: true,
      },
      new_pole_setup: {
        type: Sequelize.DECIMAL,
        allowNull: true,
      },
      open_cut: {
        type: Sequelize.DECIMAL,
        allowNull: true,
      },
      drilling: {
        type: Sequelize.DECIMAL,
        allowNull: true,
      },
      new_closure: {
        type: Sequelize.DECIMAL,
        allowNull: true,
      },
      new_splitter: {
        type: Sequelize.DECIMAL,
        allowNull: true,
      },
      fo_jointing: {
        type: Sequelize.DECIMAL,
        allowNull: true,
      },
      old_datek: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      new_datek: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      spk_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      justification: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      constraint: {
        type: Sequelize.TEXT,
        allowNull: true,
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
