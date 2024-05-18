const Sequelize = require("sequelize");
const sequelize = new Sequelize("project_ws", "root", "", {
  host: "localhost",
  port: 3306,
  dialect: "mysql",
  logging: true,
  timezone: "+07:00",
});

module.exports = sequelize;
