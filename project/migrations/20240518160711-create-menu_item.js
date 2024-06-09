"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = require("sequelize");
    await queryInterface.createTable("menu_item", {
      restaurant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      menu_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      item_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      needed_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    });

    await queryInterface.addConstraint("menu_item", {
      fields: ["restaurant_id"],
      type: "foreign key",
      name: "fk_menu_item_restaurant_id",
      references: {
        table: "restaurant",
        field: "restaurant_id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });

    await queryInterface.addConstraint("menu_item", {
      fields: ["menu_id"],
      type: "foreign key",
      name: "fk_menu_item_menu_id",
      references: {
        table: "menu",
        field: "menu_id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });

    await queryInterface.addConstraint("menu_item", {
      fields: ["item_id"],
      type: "foreign key",
      name: "fk_menu_item_item_id",
      references: {
        table: "item",
        field: "item_id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "menu_item",
      "fk_menu_item_restaurant_id"
    );
    await queryInterface.removeConstraint("menu_item", "fk_menu_item_menu_id");
    await queryInterface.removeConstraint("menu_item", "fk_menu_item_item_id");
    await queryInterface.dropTable("menu_item");
  },
};
