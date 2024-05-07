const express = require("express");
const Sequelize = require("sequelize");
const router = express.Router();
const { Op } = require("sequelize");
const axios = require("axios");
const Owner = require("../model/owner.js");
const Restaurant = require("../model/restaurant.js");
const jwt = require("jsonwebtoken");
const JWT_KEY = "efgusguygyufegauiahf";
const bcrypt = require("bcrypt");
const Joi = require("joi").extend(require("@joi/date"));

async function checkUsername(username) {
  let usernameCheck = await Owner.findOne({ where: { username: username } });
  if (usernameCheck) {
    throw new Error("Username already exist");
  }
}

async function checkEmail(email) {
  let emailCheck = await Owner.findOne({ where: { email: email } });
  if (emailCheck) {
    throw new Error("Email already exist");
  }
}

async function checkLogin(req, res, next) {
  const { username, password } = req.body;
  if ((username, password)) {
    // let pw = await bcrypt.compareSync(password);
    let usernamePasswordCheck = await Owner.findOne({
      where: { username: username },
    });
    if (usernamePasswordCheck) {
      let pw = await bcrypt.compare(password, usernamePasswordCheck.password);
      if (pw) {
        req.body.user = usernamePasswordCheck;
        next();
      } else {
        return res.status(404).json({ messages: "Password isnt valid" });
      }
    } else {
      return res.status(404).json({ messages: "Username isnt valid" });
    }
  } else {
    return res.status(400).json({ messages: "Field cant be empty" });
  }
}

router.post("/api/register", async (req, res) => {
  const { username, password, name, email, no_telepon } = req.body;
  const schema = Joi.object({
    username: Joi.string().required().external(checkUsername).messages({
      "any.required": "Field tidak boleh kosong!",
      "string.empty": "Field tidak boleh kosong!",
    }),
    password: Joi.string().min(8).required().messages({
      "any.required": "Field tidak boleh kosong!",
      "string.empty": "Field tidak boleh kosong!",
      "string.min": "Password minimal 8 character",
    }),
    name: Joi.string().required().messages({
      "any.required": "Field tidak boleh kosong!",
      "string.empty": "Field tidak boleh kosong!",
    }),
    email: Joi.string().email().external(checkEmail).required().messages({
      "string.email": "Format email harus sesuai",
      "any.required": "Field tidak boleh kosong!",
      "string.empty": "Field tidak boleh kosong!",
    }),
    no_telepon: Joi.string().min(8).max(13).required().messages({
      "any.required": "Field tidak boleh kosong!",
      "string.empty": "Field tidak boleh kosong!",
      "string.min": "Nomor telephone minimal 8 digit",
      "string.max": "Nomor telephone minimal 8 digit",
    }),
  });
  try {
    await schema.validateAsync({
      username,
      password,
      name,
      email,
      no_telepon,
    });
  } catch (error) {
    let statusCode = 400;
    return res.status(statusCode).send(error.toString());
  }
  let bcrypt_password = await bcrypt.hashSync(password, 10);

  await Owner.create({
    username,
    password: bcrypt_password,
    name,
    email,
    no_telepon,
    api_hit: 0,
  });
  return res.status(201).json({ messages: "Register Success" });
});

router.post("/api/restaurant", [checkLogin], async (req, res) => {
  const { nama_restaurant, alamat, deskripsi } = req.body;
  const schema = Joi.object({
    nama_restaurant: Joi.string().required().messages({
      "any.required": "Field tidak boleh kosong!",
      "string.empty": "Field tidak boleh kosong!",
    }),
    alamat: Joi.string().required().messages({
      "any.required": "Field tidak boleh kosong!",
      "string.empty": "Field tidak boleh kosong!",
    }),
    deskripsi: Joi.string().required().messages({
      "any.required": "Field tidak boleh kosong!",
      "string.empty": "Field tidak boleh kosong!",
    }),
  });
  try {
    await schema.validateAsync({
      nama_restaurant,
      alamat,
      deskripsi,
    });
  } catch (error) {
    let statusCode = 400;
    return res.status(statusCode).send(error.toString());
  }

  await Restaurant.create({
    nama_restaurant,
    alamat,
    deskripsi,
    owner_id: req.body.user.owner_id,
  });

  let resId = await Restaurant.findOne({
    where: {
      nama_restaurant: nama_restaurant,
      owner_id: req.body.user.owner_id,
    },
  });

  const payload = {
    username: req.body.user.username,
    restaurant_id: resId.restaurant_id,
  };

  const token = jwt.sign(payload, JWT_KEY);

  resId.update({
    api_key: token,
  });
  return res.status(201).json({ messages: "Berhasil menambahkan Restaurant" });
});

module.exports = router;
