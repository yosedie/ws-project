"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = require("sequelize");
    await queryInterface.createTable("topping", {
      topping_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      restaurant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      nama_topping: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      deskripsi_topping: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      harga_topping: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    });

    await queryInterface.addConstraint("topping", {
      fields: ["restaurant_id"],
      type: "foreign key",
      name: "fk_topping_restaurant_id",
      references: {
        table: "restaurant",
        field: "restaurant_id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "topping",
      "fk_topping_restaurant_id"
    );
    await queryInterface.dropTable("topping");
  },
};
