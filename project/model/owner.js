"use strict";
const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

class Owner extends Model {}
Owner.init(
  {
    owner_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    no_telepon: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    api_hit: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Owner",
    tableName: "owner",
    timestamps: false,
  }
);

module.exports = Owner;
