"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = require("sequelize");
    await queryInterface.createTable("menu", {
      menu_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      nama_menu: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      restaurant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      deskripsi_menu: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      harga_menu: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("active", "habis", "inactive"),
        allowNull: false,
        defaultValue: "active",
      },
    });

    await queryInterface.addConstraint("menu", {
      fields: ["restaurant_id"],
      type: "foreign key",
      name: "fk_menu_restaurant_id",
      references: {
        table: "restaurant",
        field: "restaurant_id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("menu", "fk_menu_restaurant_id");
    await queryInterface.dropTable("menu");
  },
};
