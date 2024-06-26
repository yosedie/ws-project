"use strict";
const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

class Restaurant extends Model {}
Restaurant.init(
  {
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
  },
  {
    sequelize,
    modelName: "Restaurant",
    tableName: "restaurant",
    timestamps: false,
  }
);

module.exports = Restaurant;
