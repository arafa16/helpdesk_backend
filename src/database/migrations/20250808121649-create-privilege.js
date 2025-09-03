"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("privileges", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      uuid: {
        type: Sequelize.STRING,
      },
      ticket_customer: {
        type: Sequelize.BOOLEAN,
      },
      ticket_executor: {
        type: Sequelize.BOOLEAN,
      },
      ticket: {
        type: Sequelize.BOOLEAN,
      },
      user: {
        type: Sequelize.BOOLEAN,
      },
      setting: {
        type: Sequelize.BOOLEAN,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
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
    await queryInterface.dropTable("privileges");
  },
};
