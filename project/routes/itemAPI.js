const express = require("express");
const Sequelize = require("sequelize");
const router = express.Router();
const { Op } = require("sequelize");
const axios = require("axios");
const Restaurant = require("../model/restaurant.js");
const Item = require("../model/item.js");
const jwt = require("jsonwebtoken");
const JWT_KEY = "efgusguygyufegauiahf";
const bcrypt = require("bcrypt");
const Joi = require("joi").extend(require("@joi/date"));

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
    const newData = req.body;
    try {
      const item = await Item.findByPk(itemId);
      if (!item) throw new Error('Item not found');
      
      // Update data item
      await item.update(newData);
      
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
