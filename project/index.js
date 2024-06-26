const express = require("express");
const bodyParser = require("body-parser");
const { Sequelize, DataTypes } = require("sequelize");
const Joi = require("joi").extend(require("@joi/date"));
const axios = require("axios").default;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const apiKey = process.env.JWT_KEY;
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const clientLoginRouter = require("./routes/loginRegisterClient");
const MemberLoginRouter = require("./routes/loginRegisterMember");
const reviewApiRouter = require("./routes/reviewApi");
const itemApiRouter = require("./routes/itemAPI");
const transactionApiRouter = require("./routes/transactionAPI");
const kuponApiRouter = require("./routes/kuponAPI");

app.use("/", kuponApiRouter);
app.use("/", clientLoginRouter);
app.use("/", MemberLoginRouter);
app.use("/", reviewApiRouter);
app.use("/", itemApiRouter);
app.use("/", transactionApiRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});
