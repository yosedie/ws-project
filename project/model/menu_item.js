const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

class Menu_item extends Model {}
Menu_item.init(
  {
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
  },
  {
    sequelize,
    modelName: "Menu_item",
    tableName: "menu_item",
    timestamps: false,
  }
);

module.exports = Menu_item;
