const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

class Menu extends Model {}
Menu.init(
  {
    menu_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    menu_picture: {
      type: DataTypes.STRING,
      allowNull: true,
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
  },
  {
    sequelize,
    modelName: "Menu",
    tableName: "menu",
    timestamps: false,
  }
);

module.exports = Menu;
