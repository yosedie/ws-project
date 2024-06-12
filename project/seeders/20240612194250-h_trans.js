"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "H_trans",
      [
        {
          restaurant_id: 1,
          member_id: 5,
          kupon_id: 1,
          status_transaksi: 0,
          subtotal: 141000,
          grand_total: 131000,
        },
        {
          restaurant_id: 2,
          member_id: 4,
          kupon_id: 2,
          status_transaksi: 1,
          subtotal: 94000,
          grand_total: 79000,
        },
        {
          restaurant_id: 2,
          member_id: 7,
          kupon_id: 3,
          status_transaksi: 4,
          subtotal: 110000,
          grand_total: 95000,
        },
        {
          restaurant_id: 3,
          member_id: 6,
          kupon_id: null,
          status_transaksi: 3,
          subtotal: 116000,
          grand_total: 116000,
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("H_trans", null, {});
  },
};
