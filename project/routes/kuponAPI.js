const express = require("express");
const Sequelize = require("sequelize");
const router = express.Router();
const { Op } = require("sequelize");
const axios = require("axios");
const Kupon = require("../model/kupon.js");
const jwt = require("jsonwebtoken");
const JWT_KEY = "efgusguygyufegauiahf";
const bcrypt = require("bcrypt");
const Joi = require("joi").extend(require("@joi/date"));

// Define Joi schema for kupon
const kuponSchema = Joi.object({
  restaurant_id: Joi.number().integer().required(),
  member_id: Joi.number().integer().required(),
  potongan: Joi.number().integer().required(),
  masa_berlaku: Joi.date().iso().required().raw(), // Tambahkan .raw() agar tidak memiliki "T00:00:00.000Z"
});

// GET all kupons
router.get("/api/kupons", async (req, res) => {
  try {
    const kupons = await Kupon.findAll();
    res.json(kupons);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve kupons" });
  }
});

// POST a new kupon
router.post("/api/kupons", async (req, res) => {
  const { error } = kuponSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const newKupon = await Kupon.create(req.body);
    res.status(201).json(newKupon);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create kupon" });
  }
});

// PUT update an existing kupon
router.put("/api/kupons/:id", async (req, res) => {
  const kuponId = req.params.id;
  const { error } = kuponSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const kupon = await Kupon.findByPk(kuponId);
    if (!kupon) throw new Error("Kupon not found");

    // Update data kupon
    await kupon.update(req.body);

    res.json(kupon);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update kupon" });
  }
});

// DELETE a kupon (destroy it)
router.delete("/api/kupons/:id", async (req, res) => {
  const kuponId = req.params.id;
  try {
    const kupon = await Kupon.findByPk(kuponId);
    if (!kupon) throw new Error("Kupon not found");

    // Hapus kupon secara permanen
    await kupon.destroy();

    return res.status(200).json({ message: "Kupon berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal menghapus kupon" });
  }
});

module.exports = router;
