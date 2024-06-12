const express = require("express");
const Sequelize = require("sequelize");
const router = express.Router();
const { Op } = require("sequelize");
const axios = require("axios");
const Kupon = require("../model/kupon.js");
const Owner = require("../model/owner.js");
const Restaurant = require("../model/restaurant.js");
const Member = require("../model/member.js");
const jwt = require("jsonwebtoken");
const JWT_KEY = "efgusguygyufegauiahf";
const bcrypt = require("bcrypt");
const Joi = require("joi").extend(require("@joi/date"));

// Define Joi schema for kupon
const kuponSchema = Joi.object({
  potongan: Joi.number().integer().required(),
  masa_berlaku: Joi.date().iso().required().raw(), // Tambahkan .raw() agar tidak memiliki "T00:00:00.000Z"
});

// func pembantu
async function kurangiApiHit(owner) {
  let update = await owner.update({
    api_hit: owner.api_hit - 1,
  });
}
// middleware

async function checkApiKey(req, res, next) {
  const api_key = req.header("Authorization");
  if (!api_key) {
    return res.status(400).json({ messages: "api_key harus diisi" });
  }
  try {
    let data = jwt.verify(api_key, JWT_KEY);
    // isi dari jwt key username owner dan id resto
    req.body.dataKey = data;
    next();
  } catch (error) {
    let code = 400;
    let errorMsg = error.toString().split(": ")[1];
    errorMsg = errorMsg.split(" (")[0];
    return res.status(code).json({
      messages: errorMsg,
    });
  }
}

async function checkApiHit(req, res, next) {
  let { username, restaurant_id } = req.body.dataKey;

  let owner = await Owner.findOne({
    where: { username: username },
  });

  let resto = await Restaurant.findByPk(restaurant_id);

  if (owner.api_hit > 0) {
    req.body.owner = owner;
    req.body.resto = resto;
    next();
  } else {
    return res.status(400).json({ messages: "api hit tidak cukup" });
  }
}

async function checkLoginMember(req, res, next) {
  const { username, password } = req.body;
  if (username && password) {
    let user = await Member.findOne({ where: { username: username } });
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
  } else {
    return res.status(400).json({ messages: "Field can't be empty" });
  }
}

// GET all kupons
router.get(
  "/api/v1/kupons",
  [checkApiKey, checkLoginMember, checkApiHit],
  async (req, res) => {
    let owner = req.body.owner;
    try {
      const kupons = await Kupon.findAll();
      await kurangiApiHit(owner);
      return res.status(200).json(kupons);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to retrieve kupons" });
    }
  }
);

// POST a new kupon
router.post(
  "/api/v1/kupons",
  [checkApiKey, checkLoginMember, checkApiHit],
  async (req, res) => {
    const { potongan, masa_berlaku } = req.body;
    let resto = req.body.resto;
    let owner = req.body.owner;
    let user = req.body.user;
    const { error } = kuponSchema.validate({
      potongan,
      masa_berlaku,
    });
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
      const newKupon = await Kupon.create({
        restaurant_id: resto.restaurant_id,
        member_id: user.member_id,
        potongan: potongan,
        masa_berlaku: masa_berlaku,
      });
      await kurangiApiHit(owner);
      return res.status(201).json(newKupon);
    } catch (error) {
      console.error(error);
      return res.status(400).json({ error: "Failed to create kupon" });
    }
  }
);

// PUT update an existing kupon
router.put(
  "/api/v1/kupons/:id",
  [checkApiKey, checkLoginMember, checkApiHit],
  async (req, res) => {
    const { potongan, masa_berlaku } = req.body;
    const kuponId = req.params.id;
    const { error } = kuponSchema.validate({
      potongan,
      masa_berlaku,
    });
    let owner = req.body.owner;
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
      const kupon = await Kupon.findByPk(kuponId);
      if (!kupon) return res.status(404).json({ error: "Kupon not found" });

      // Update data kupon
      await kupon.update(req.body);
      await kurangiApiHit(owner);
      return res.status(200).json(kupon);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to update kupon" });
    }
  }
);

// DELETE a kupon (destroy it)
router.delete(
  "/api/v1/kupons/:id",
  [checkApiKey, checkLoginMember, checkApiHit],
  async (req, res) => {
    const kuponId = req.params.id;
    let owner = req.body.owner;
    try {
      const kupon = await Kupon.findByPk(kuponId);
      if (!kupon) return res.status(404).json({ error: "Kupon not found" });

      // Hapus kupon secara permanen
      await kupon.destroy();
      await kurangiApiHit(owner);
      return res.status(200).json({ message: "Kupon berhasil dihapus" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Gagal menghapus kupon" });
    }
  }
);

module.exports = router;
