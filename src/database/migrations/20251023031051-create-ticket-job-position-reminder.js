"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("ticket_job_position_reminders", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      uuid: {
        type: Sequelize.STRING,
      },
      ticket_id: {
        type: Sequelize.INTEGER,
      },
      job_position_id: {
        type: Sequelize.INTEGER,
      },
      reminder: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      schedule_reminder: {
        type: Sequelize.DATE,
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
    await queryInterface.dropTable("ticket_job_position_reminders");
  },
};
