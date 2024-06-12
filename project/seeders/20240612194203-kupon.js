"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "kupon",
      [
        {
          restaurant_id: 1,
          member_id: 5,
          potongan: 10000,
          masa_berlaku: "2024-12-31",
        },
        {
          restaurant_id: 2,
          member_id: 4,
          potongan: 15000,
          masa_berlaku: "2024-11-30",
        },
        {
          restaurant_id: 2,
          member_id: 7,
          potongan: 15000,
          masa_berlaku: "2024-11-30",
        },
        {
          restaurant_id: 3,
          member_id: 6,
          potongan: 20000,
          masa_berlaku: "2024-10-31",
        },
        {
          restaurant_id: 1,
          member_id: 5,
          potongan: 5000,
          masa_berlaku: "2024-09-30",
        },
        {
          restaurant_id: 2,
          member_id: 4,
          potongan: 3000,
          masa_berlaku: "2024-08-31",
        },
        {
          restaurant_id: 2,
          member_id: 7,
          potongan: 3000,
          masa_berlaku: "2024-08-31",
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("kupon", null, {});
  },
};
