"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "owner",
      [
        {
          username: "myui",
          password:
            "$2b$10$G/UFc9j9bT.1Dmnc.i.I7eHY3BNWAmSk7GsmQAaDm.ZtuYD363Anu", // In real applications, hash passwords
          name: "myui",
          email: "myui@gmail.com",
          no_telepon: "08912312412",
          api_hit: 100,
        },
        {
          username: "owner1",
          password:
            "$2b$10$ElYa11tHDVWaCzstDUBIS.CwustmiqV6uqZE37IkxqomGO6kE4Dam", // In real applications, hash passwords
          name: "Owner One",
          email: "owner1@example.com",
          no_telepon: "1234567890",
          api_hit: 100,
        },
        {
          username: "owner2",
          password:
            "$2b$10$xhyEOZ7S8rbVZXzzp3AnkuH/WQ70nw5Qd1sVkoJfy7ou7njeRsMGi", // In real applications, hash passwords
          name: "Owner Two",
          email: "owner2@example.com",
          no_telepon: "0987654321",
          api_hit: 150,
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("owner", null, {});
  },
};
