const express = require("express");
const Sequelize = require("sequelize");
const router = express.Router();
const { Op } = require("sequelize");
const axios = require("axios");
const Member = require("../model/member.js");
const jwt = require("jsonwebtoken");
const JWT_KEY = "efgusguygyufegauiahf";
const bcrypt = require("bcrypt");

async function checkUsername(username) {
  let usernameCheck = await Member.findOne({ where: { username: username } });
  if (usernameCheck) {
    throw new Error("Username already exist");
  }
}

async function checkEmail(email) {
  let emailCheck = await Member.findOne({ where: { email: email } });
  if (emailCheck) {
    throw new Error("Email already exist");
  }
}

//mines restaurant_id
router.post("/api/register", async (req, res) => {
  const { username, password, confirm_password, nama_member, email } = req.body;
  const schema = Joi.object({
    username: Joi.string().required().extend(checkUsername).messages({
      "any.required": "Field tidak boleh kosong!",
      "string.empty": "Field tidak boleh kosong!",
    }),
    password: Joi.string().min(8).required().messages({
      "any.required": "Field tidak boleh kosong!",
      "string.empty": "Field tidak boleh kosong!",
      "string.min": "Password minimal 8 character",
    }),
    confirm_password: Joi.string()
      .valid(Joi.ref("password"))
      .required()
      .label("Confirm password")
      .messages({
        "any.only": "Password tidak cocok",
        "any.required": "Field tidak boleh kosong!",
        "string.empty": "Field tidak boleh kosong!",
      }),
    nama_member: Joi.string().required().messages({
      "any.required": "Field tidak boleh kosong!",
      "string.empty": "Field tidak boleh kosong!",
    }),
    email: Joi.string().email().extend(checkEmail).required().messages({
      "string.email": "Format email harus sesuai",
      "any.required": "Field tidak boleh kosong!",
      "string.empty": "Field tidak boleh kosong!",
    }),
  });

  try {
    await schema.validateAsync({
      username,
      password,
      nama_member,
      email,
    });
  } catch (error) {
    let statusCode = 400;
    return res.status(statusCode).send(error.toString());
  }

  let bcrypt_password = bcrypt(password, 10);

  await Member.create({
    restaurant_id: 1,
    username,
    password: bcrypt_password,
    nama_member,
    email,
    role: 1,
  });
  return res.status(201).json({ messages: "Register Success" });
});

module.exports = router;
