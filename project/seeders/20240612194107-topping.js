"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "topping",
      [
        {
          restaurant_id: 1,
          nama_topping: "Topping One",
          deskripsi_topping: "Description for Topping One",
          harga_topping: 5000,
        },
        {
          restaurant_id: 2,
          nama_topping: "Topping Two",
          deskripsi_topping: "Description for Topping Two",
          harga_topping: 7000,
        },
        {
          restaurant_id: 1,
          nama_topping: "Topping Three",
          deskripsi_topping: "Description for Topping Three",
          harga_topping: 6000,
        },
        {
          restaurant_id: 3,
          nama_topping: "Topping Four",
          deskripsi_topping: "Description for Topping Four",
          harga_topping: 8000,
        },
        {
          restaurant_id: 2,
          nama_topping: "Topping Five",
          deskripsi_topping: "Description for Topping Five",
          harga_topping: 7500,
        },
        {
          restaurant_id: 1,
          nama_topping: "Topping Six",
          deskripsi_topping: "Description for Topping Six",
          harga_topping: 6500,
        },
        {
          restaurant_id: 3,
          nama_topping: "Topping Seven",
          deskripsi_topping: "Description for Topping Seven",
          harga_topping: 9000,
        },
        {
          restaurant_id: 2,
          nama_topping: "Topping Eight",
          deskripsi_topping: "Description for Topping Eight",
          harga_topping: 5500,
        },
        {
          restaurant_id: 1,
          nama_topping: "Topping Nine",
          deskripsi_topping: "Description for Topping Nine",
          harga_topping: 4500,
        },
        {
          restaurant_id: 3,
          nama_topping: "Topping Ten",
          deskripsi_topping: "Description for Topping Ten",
          harga_topping: 8500,
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("topping", null, {});
  },
};
