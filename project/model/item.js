const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

class Item extends Model {}
Item.init(
  {
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
  },
  {
    sequelize,
    modelName: "Item",
    tableName: "item",
    timestamps: false,
  }
);

module.exports = Item;
