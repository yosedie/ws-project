"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "menu",
      [
        {
          restaurant_id: 1,
          nama_menu: "Menu One",
          deskripsi_menu: "Description for Menu One",
          harga_menu: 10000,
          status: "active",
        },
        {
          restaurant_id: 2,
          nama_menu: "Menu Two",
          deskripsi_menu: "Description for Menu Two",
          harga_menu: 20000,
          status: "active",
        },
        {
          restaurant_id: 1,
          nama_menu: "Menu Three",
          deskripsi_menu: "Description for Menu Three",
          harga_menu: 15000,
          status: "active",
        },
        {
          restaurant_id: 3,
          nama_menu: "Menu Four",
          deskripsi_menu: "Description for Menu Four",
          harga_menu: 25000,
          status: "active",
        },
        {
          restaurant_id: 2,
          nama_menu: "Menu Five",
          deskripsi_menu: "Description for Menu Five",
          harga_menu: 30000,
          status: "active",
        },
        {
          restaurant_id: 1,
          nama_menu: "Menu Six",
          deskripsi_menu: "Description for Menu Six",
          harga_menu: 12000,
          status: "active",
        },
        {
          restaurant_id: 3,
          nama_menu: "Menu Seven",
          deskripsi_menu: "Description for Menu Seven",
          harga_menu: 22000,
          status: "active",
        },
        {
          restaurant_id: 2,
          nama_menu: "Menu Eight",
          deskripsi_menu: "Description for Menu Eight",
          harga_menu: 18000,
          status: "active",
        },
        {
          restaurant_id: 1,
          nama_menu: "Menu Nine",
          deskripsi_menu: "Description for Menu Nine",
          harga_menu: 16000,
          status: "active",
        },
        {
          restaurant_id: 3,
          nama_menu: "Menu Ten",
          deskripsi_menu: "Description for Menu Ten",
          harga_menu: 27000,
          status: "active",
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("menu", null, {});
  },
};
