const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

class Htrans extends Model {}
Htrans.init(
  {
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
    status_transaksi: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Htrans",
    tableName: "h_trans",
    timestamps: false,
  }
);

module.exports = Htrans;
