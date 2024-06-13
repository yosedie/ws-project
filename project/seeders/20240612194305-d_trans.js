"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "D_trans",
      [
        {
          trans_id: 1,
          menu_id: 1,
          quantitas: 2,
          subtotal: 20000,
        },
        {
          trans_id: 1,
          menu_id: 3,
          quantitas: 3,
          subtotal: 45000,
        },
        {
          trans_id: 1,
          menu_id: 6,
          quantitas: 1,
          subtotal: 12000,
        },
        {
          trans_id: 1,
          menu_id: 9,
          quantitas: 4,
          subtotal: 64000,
        },
        {
          trans_id: 2,
          menu_id: 2,
          quantitas: 2,
          subtotal: 40000,
        },
        {
          trans_id: 2,
          menu_id: 8,
          quantitas: 3,
          subtotal: 54000,
        },
        {
          trans_id: 3,
          menu_id: 5,
          quantitas: 1,
          subtotal: 30000,
        },
        {
          trans_id: 3,
          menu_id: 2,
          quantitas: 4,
          subtotal: 80000,
        },
        {
          trans_id: 4,
          menu_id: 4,
          quantitas: 2,
          subtotal: 50000,
        },
        {
          trans_id: 4,
          menu_id: 7,
          quantitas: 3,
          subtotal: 66000,
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("D_trans", null, {});
  },
};
