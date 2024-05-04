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
    detail_transaksi: {
      type: DataTypes.STRING,
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
