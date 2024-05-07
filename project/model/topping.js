const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

class Topping extends Model {}
Topping.init(
  {
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
  },
  {
    sequelize,
    modelName: "Topping",
    tableName: "topping",
    timestamps: false,
  }
);

module.exports = Topping;
