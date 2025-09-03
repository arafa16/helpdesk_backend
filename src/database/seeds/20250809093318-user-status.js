'use strict';
const uuid = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('user_statuses',[
      {
        id:1,
        uuid:uuid.v4(),
        name:'register',
        sequence:1,
        code:1,
        is_active:true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id:2,
        uuid:uuid.v4(),
        name:'active',
        sequence:2,
        code:2,
        is_active:true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id:3,
        uuid:uuid.v4(),
        name:'non active',
        sequence:3,
        code:3,
        is_active:true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id:4,
        uuid:uuid.v4(),
        name:'deleted',
        sequence:4,
        code:4,
        is_active:true,
        created_at: new Date(),
        updated_at: new Date(),
      }
    ])
  },

  async down (queryInterface, Sequelize) {
    queryInterface.bulkDelete('user_statuses', null, {});
  }
};
