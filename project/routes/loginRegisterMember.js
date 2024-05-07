const express = require("express");
const Sequelize = require("sequelize");
const router = express.Router();
const { Op } = require("sequelize");
const axios = require("axios");
const Member = require("../model/member.js");
const Restaurant = require("../model/restaurant.js");
const Owner = require("../model/owner.js");
const jwt = require("jsonwebtoken");
const JWT_KEY = "efgusguygyufegauiahf";
const bcrypt = require("bcrypt");
const Joi = require("joi").extend(require("@joi/date"));

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

async function checkApiKey(req, res, next) {
  const api_key = req.header("Authorization");
  let valid = await Restaurant.findOne({ where: { api_key: api_key } });
  if (valid) {
    let owner = await Owner.findOne({ where: { owner_id: valid.owner_id } });
    req.body.restaurant = valid;
    req.body.owner = owner;
    next();
  } else {
    return res.status(400).json({ messages: "api_key tidak valid" });
  }
}

async function checkLogin(req, res, next) {
  const { username, password } = req.body;
  let user = await Owner.findOne({ where: { username: username } });
  if (user) {
    let pwd = bcrypt.compare(password, user.password);
    if (pwd) {
      req.body.user = user;
      next();
    } else {
      return res.status(400).json({ messages: "Password isnt Correct" });
    }
  } else {
    return res.status(400).json({ messages: "Username isnt Correct" });
  }
}

router.get("/api/api_key", [checkLogin], async (req, res) => {
  const { nama_restaurant } = req.body;
  let user = req.body.user;
  if (nama_restaurant) {
    let resto = await Restaurant.findOne({
      where: { nama_restaurant: nama_restaurant },
    });
    if (resto) {
      if (user.owner_id == resto.owner_id) {
        return res.status(200).json({ api_key: resto.api_key });
      }
    } else {
      return res.status(400).json({ messages: "Restaurant not found" });
    }
  } else {
    return res.status(400).json({ messages: "field cant be empty" });
  }
});

//mines restaurant_id
router.post("/api/registermember", async (req, res) => {
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
      confirm_password,
      nama_member,
      email,
    });
  } catch (error) {
    let statusCode = 400;
    return res.status(statusCode).send(error.toString());
  }

  let bcrypt_password = await bcrypt.hashSync(password, 10);

  await Member.create({
    restaurant_id: 1,
    // restaurant_id: req.body.restaurant.restaurant_id,
    username,
    password: bcrypt_password,
    nama_member,
    email,
    role: "member",
  });
  return res.status(201).json({ messages: "Register Success" });
});

module.exports = router;
