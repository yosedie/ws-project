const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

class Dtrans extends Model {}
Dtrans.init(
  {
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
  },
  {
    sequelize,
    modelName: "Dtrans",
    tableName: "d_trans",
    timestamps: false,
  }
);

module.exports = Dtrans;
