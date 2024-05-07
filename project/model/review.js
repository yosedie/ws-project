const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
class Review extends Model {}
Review.init(
    {
      review_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      owner_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active',
      },
    },
    {
      sequelize,
      modelName: "Review",
      tableName: "review",
      timestamps: false,
    }
  );
module.exports = Review;