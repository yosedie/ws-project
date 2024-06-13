"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = require("sequelize");
    await queryInterface.createTable("H_trans", {
      trans_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      restaurant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      member_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      kupon_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      status_transaksi: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      subtotal: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      grand_total: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    });

    await queryInterface.addConstraint("H_trans", {
      fields: ["restaurant_id"],
      type: "foreign key",
      name: "fk_h_trans_restaurant_id",
      references: {
        table: "restaurant",
        field: "restaurant_id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });

    await queryInterface.addConstraint("H_trans", {
      fields: ["member_id"],
      type: "foreign key",
      name: "fk_h_trans_member_id",
      references: {
        table: "member",
        field: "member_id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });

    await queryInterface.addConstraint("H_trans", {
      fields: ["kupon_id"],
      type: "foreign key",
      name: "fk_h_trans_kupon_id",
      references: {
        table: "kupon",
        field: "kupon_id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "H_trans",
      "fk_h_trans_restaurant_id"
    );
    await queryInterface.removeConstraint("H_trans", "fk_h_trans_member_id");
    await queryInterface.removeConstraint("H_trans", "fk_h_trans_kupon_id");
    await queryInterface.dropTable("H_trans");
  },
};
