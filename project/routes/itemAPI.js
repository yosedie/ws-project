const express = require("express");
const Sequelize = require("sequelize");
const router = express.Router();
const { Op } = require("sequelize");
const axios = require("axios");
const Item = require("../model/item.js");
const jwt = require("jsonwebtoken");
const JWT_KEY = "efgusguygyufegauiahf";
const bcrypt = require("bcrypt");
const Joi = require("joi").extend(require("@joi/date"));

// Define Joi schema for item
const itemSchema = Joi.object({
  nama_item: Joi.string().required(),
  restaurant_id: Joi.number().integer().required(),
  quantitas: Joi.number().integer().required(),
  satuan: Joi.string().required(),
  status: Joi.string().valid('active', 'inactive').optional(),
});

// GET all active items
router.get('/api/items', async (req, res) => {
  try {
    const activeItems = await Item.findAll({
      where: { status: 'active' }
    });
    res.json(activeItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve active items' });
  }
});

// POST a new item
router.post('/api/items', async (req, res) => {
  const { error } = itemSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const newItem = await Item.create(req.body);
    res.status(201).json(newItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// PUT update an existing item
router.put('/api/items/:id', async (req, res) => {
  const itemId = req.params.id;
  const { error } = itemSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const item = await Item.findByPk(itemId);
    if (!item) throw new Error('Item not found');
    
    // Update data item
    await item.update(req.body);
    
    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// DELETE an item (set status to inactive)
router.delete('/api/items/:id', async (req, res) => {
  const itemId = req.params.id;
  try {
    const item = await Item.findByPk(itemId);
    if (!item) throw new Error('Item not found');

    // Menonaktifkan item dengan mengubah statusnya menjadi 'inactive'
    await item.update({ status: 'inactive' });

    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});
  
  module.exports = router;
