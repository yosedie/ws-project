const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

class Kupon extends Model {}
Kupon.init(
  {
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
  },
  {
    sequelize,
    modelName: "Kupon",
    tableName: "kupon",
    timestamps: false,
  }
);

module.exports = Kupon;
