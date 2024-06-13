"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "item",
      [
        {
          nama_item: "Item One",
          restaurant_id: 1,
          quantitas: 10,
          satuan: "pcs",
          status: "active",
        },
        {
          nama_item: "Item Two",
          restaurant_id: 2,
          quantitas: 20,
          satuan: "pcs",
          status: "active",
        },
        {
          nama_item: "Item Three",
          restaurant_id: 1,
          quantitas: 30,
          satuan: "pcs",
          status: "inactive",
        },
        {
          nama_item: "Item Four",
          restaurant_id: 3,
          quantitas: 40,
          satuan: "pcs",
          status: "active",
        },
        {
          nama_item: "Item Five",
          restaurant_id: 2,
          quantitas: 50,
          satuan: "pcs",
          status: "inactive",
        },
        {
          nama_item: "Item Six",
          restaurant_id: 1,
          quantitas: 60,
          satuan: "pcs",
          status: "active",
        },
        {
          nama_item: "Item Seven",
          restaurant_id: 3,
          quantitas: 70,
          satuan: "pcs",
          status: "inactive",
        },
        {
          nama_item: "Item Eight",
          restaurant_id: 2,
          quantitas: 80,
          satuan: "pcs",
          status: "active",
        },
        {
          nama_item: "Item Nine",
          restaurant_id: 1,
          quantitas: 90,
          satuan: "pcs",
          status: "inactive",
        },
        {
          nama_item: "Item Ten",
          restaurant_id: 3,
          quantitas: 100,
          satuan: "pcs",
          status: "active",
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("item", null, {});
  },
};
