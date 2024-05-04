const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

class Member extends Model {}
Member.init(
  {
    member_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    nama_member: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Member",
    tableName: "member",
    timestamps: false,
  }
);

module.exports = Member;
