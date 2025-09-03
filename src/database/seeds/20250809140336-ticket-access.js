'use strict';
const uuid = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('ticket_accesses',[
      {
        id:1,
        uuid:uuid.v4(),
        name:'GPON',
        sequence:1,
        code:1,
        is_active:true,
        created_at: new Date(),
        updated_at: new Date(),
      }
    ])
  },

  async down (queryInterface, Sequelize) {
    queryInterface.bulkDelete('ticket_accesses', null, {});
  }
};
