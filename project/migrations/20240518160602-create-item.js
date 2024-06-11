"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = require("sequelize");
    await queryInterface.createTable("item", {
      item_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      nama_item: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      restaurant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      quantitas: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      satuan: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("active", "inactive"),
        allowNull: false,
        defaultValue: "active",
      },
    });

    await queryInterface.addConstraint("item", {
      fields: ["restaurant_id"],
      type: "foreign key",
      name: "fk_item_restaurant_id",
      references: {
        table: "restaurant",
        field: "restaurant_id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("item", "fk_item_restaurant_id");
    await queryInterface.dropTable("item");
  },
};
