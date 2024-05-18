"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = require("sequelize");
    await queryInterface.createTable("D_trans", {
      d_trans_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      trans_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      menu_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      quantitas: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      subtotal: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    });

    await queryInterface.addConstraint("D_trans", {
      fields: ["trans_id"],
      type: "foreign key",
      name: "fk_d_trans_trans_id",
      references: {
        table: "H_trans",
        field: "trans_id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });

    await queryInterface.addConstraint("D_trans", {
      fields: ["menu_id"],
      type: "foreign key",
      name: "fk_d_trans_menu_id",
      references: {
        table: "menu",
        field: "menu_id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("D_trans", "fk_d_trans_trans_id");
    await queryInterface.removeConstraint("D_trans", "fk_d_trans_menu_id");
    await queryInterface.dropTable("D_trans");
  },
};
