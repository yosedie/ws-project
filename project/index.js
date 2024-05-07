const express = require("express");
const bodyParser = require("body-parser");
const { Sequelize, DataTypes } = require("sequelize");
const Joi = require("joi").extend(require("@joi/date"));
const axios = require("axios").default;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const apiKey = process.env.JWT_KEY;
const router = require("./routes/loginRegisterAPI");

require("dotenv").config();

const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/", router);

const clientLoginRouter = require("./routes/loginRegisterClient");
const MemberLoginRouter = require("./routes/loginRegisterMember");

app.use("/", clientLoginRouter);
app.use("/", MemberLoginRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});
