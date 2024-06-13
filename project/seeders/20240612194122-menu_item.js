"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "menu_item",
      [
        {
          restaurant_id: 1,
          menu_id: 1,
          item_id: 1,
          needed_quantity: 2,
        },
        {
          restaurant_id: 1,
          menu_id: 1,
          item_id: 2,
          needed_quantity: 3,
        },
        {
          restaurant_id: 2,
          menu_id: 2,
          item_id: 3,
          needed_quantity: 1,
        },
        {
          restaurant_id: 2,
          menu_id: 2,
          item_id: 4,
          needed_quantity: 4,
        },
        {
          restaurant_id: 3,
          menu_id: 3,
          item_id: 5,
          needed_quantity: 2,
        },
        {
          restaurant_id: 3,
          menu_id: 3,
          item_id: 6,
          needed_quantity: 3,
        },
        {
          restaurant_id: 1,
          menu_id: 4,
          item_id: 1,
          needed_quantity: 5,
        },
        {
          restaurant_id: 1,
          menu_id: 4,
          item_id: 2,
          needed_quantity: 2,
        },
        {
          restaurant_id: 2,
          menu_id: 5,
          item_id: 3,
          needed_quantity: 6,
        },
        {
          restaurant_id: 3,
          menu_id: 6,
          item_id: 4,
          needed_quantity: 3,
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("menu_item", null, {});
  },
};
