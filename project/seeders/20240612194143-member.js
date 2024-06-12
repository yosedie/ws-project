"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "member",
      [
        {
          restaurant_id: 1,
          username: "admin",
          password:
            "$2b$10$XIF.kXkj9NW3OvgaFO8XZ.oY7XvOX6CkAshpscMGLOwgSgmkYUdpW", // In real applications, hash passwords
          nama_member: "admin",
          email: "admin@example.com",
          role: "admin",
        },
        {
          restaurant_id: 2,
          username: "admin",
          password:
            "$2b$10$Gzsd60cLHP9YZA5nIcUtEe4G4sS1dRp7USlwjqCilayrrMtku3NF2", // In real applications, hash passwords
          nama_member: "admin",
          email: "admin@example.com",
          role: "admin",
        },
        {
          restaurant_id: 3,
          username: "admin",
          password:
            "$2b$10$Vz4ZewcMy2f0QSfv6/mQ.u9vReT3S6aW/CFlz9UipQD98x6wB.Ch6", // In real applications, hash passwords
          nama_member: "admin",
          email: "admin@example.com",
          role: "admin",
        },
        {
          restaurant_id: 2,
          username: "jane_smith",
          password:
            "$2b$10$vw/2CH2RZxi85k49snaJiO4Q6qt2vUQsUd27TRrTxdCXMea4W9O/W", // In real applications, hash passwords
          nama_member: "Jane Smith",
          email: "jane.smith@example.com",
          role: "user",
        },
        {
          restaurant_id: 1,
          username: "alice_johnson",
          password:
            "$2b$10$wwaONwZ1o5.HZdhcraXyJ.Es3ZeXtRyLZ7l64UY4Sf6rbK3Y55uY.", // In real applications, hash passwords
          nama_member: "Alice Johnson",
          email: "alice.johnson@example.com",
          role: "user",
        },
        {
          restaurant_id: 3,
          username: "bob_brown",
          password:
            "$2b$10$PIoOLwclEsMAU3ZgVmJWZ.RebZqxcyqcTs2FiCU1pXnJjJeG6Vn/S", // In real applications, hash passwords
          nama_member: "Bob Brown",
          email: "bob.brown@example.com",
          role: "user",
        },
        {
          restaurant_id: 2,
          username: "charlie_davis",
          password:
            "$2b$10$XAhWVmkzLzJb2OPGxKUULeiXTqj3dJxJlE1a23mH7bDqkdgTjQT6u", // In real applications, hash passwords
          nama_member: "Charlie Davis",
          email: "charlie.davis@example.com",
          role: "user",
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("member", null, {});
  },
};
