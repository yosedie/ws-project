const Sequelize = require("sequelize");
const sequelize = new Sequelize("t7_222117067", "root", "", {
  host: "localhost",
  port: 3306,
  dialect: "mysql",
  logging: false,
});

module.exports = sequelize;
