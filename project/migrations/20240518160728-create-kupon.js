"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = require("sequelize");
    await queryInterface.createTable("kupon", {
      kupon_id: {
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
      potongan: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      masa_berlaku: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addConstraint("kupon", {
      fields: ["restaurant_id"],
      type: "foreign key",
      name: "fk_kupon_restaurant_id",
      references: {
        table: "restaurant",
        field: "restaurant_id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });

    await queryInterface.addConstraint("kupon", {
      fields: ["member_id"],
      type: "foreign key",
      name: "fk_kupon_member_id",
      references: {
        table: "member",
        field: "member_id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("kupon", "fk_kupon_restaurant_id");
    await queryInterface.removeConstraint("kupon", "fk_kupon_member_id");
    await queryInterface.dropTable("kupon");
  },
};
