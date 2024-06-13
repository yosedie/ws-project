"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "restaurant",
      [
        {
          nama_restaurant: "domino pizza",
          alamat: "jln arimuana",
          deskripsi: "best pizza in your location",
          api_key:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im15dWkiLCJyZXN0YXVyYW50X2lkIjoxLCJpYXQiOjE3MTgwOTQzNDR9.QgUnrNbL4obp6NFik4VU38BNA3rM0waMD3IM5WEUOg8",
          owner_id: 1,
        },
        {
          nama_restaurant: "slay chicken",
          alamat: "thick chick St",
          deskripsi: "naurr ch!ck",
          api_key:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im93bmVyMSIsInJlc3RhdXJhbnRfaWQiOjMsImlhdCI6MTcxODIyMTc4NH0.NqMW12VO4GSANRzgc_Pd6mywWWNaYtAN8dagUR2WBlM",
          owner_id: 2,
        },
        {
          nama_restaurant: "Restaurant Two",
          alamat: "456 Elm St",
          deskripsi: "The second restaurant",
          api_key:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im93bmVyMiIsInJlc3RhdXJhbnRfaWQiOjQsImlhdCI6MTcxODIyMTk1Nn0._Rw0kUX3UECXVxL-uqebQZsS57Uhue64znWrXa0201w",
          owner_id: 3,
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("restaurant", null, {});
  },
};
