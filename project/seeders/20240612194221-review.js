"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "review",
      [
        {
          restaurant_id: 1,
          member_id: 5,
          comment: "This restaurant is amazing!",
          status: "active",
        },
        {
          restaurant_id: 2,
          member_id: 4,
          comment: "Great food and service!",
          status: "active",
        },
        {
          restaurant_id: 3,
          member_id: 6,
          comment: "Nice ambiance but the food could be better.",
          status: "active",
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("review", null, {});
  },
};
