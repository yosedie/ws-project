"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = require("sequelize");
    await queryInterface.createTable("restaurant", {
      restaurant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      nama_restaurant: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      alamat: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      deskripsi: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      owner_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      api_key: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    });

    await queryInterface.addConstraint("restaurant", {
      fields: ["owner_id"],
      type: "foreign key",
      name: "fk_restaurant_owner_id",
      references: {
        table: "owner",
        field: "owner_id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "restaurant",
      "fk_restaurant_owner_id"
    );
    await queryInterface.dropTable("restaurant");
  },
};
