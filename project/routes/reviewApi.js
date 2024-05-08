const express = require("express");
const Sequelize = require("sequelize");
const router = express.Router();
const { Op } = require("sequelize");
const axios = require("axios");
const Owner = require("../model/owner.js");
const Review = require("../model/review.js");
const jwt = require("jsonwebtoken");
const JWT_KEY = "efgusguygyufegauiahf";
const bcrypt = require("bcrypt");
const Joi = require("joi").extend(require("@joi/date"));

// GET all reviews
router.get("/api/reviews", async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: {
        status: 'active'
      }
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get reviews' });
  }
});


// POST a new review
router.post("/api/reviews", async (req, res) => {
  const { owner_id, comment } = req.body;
  try {
    const newReview = await Review.create({ owner_id, comment });
    res.status(201).json(newReview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// PUT update a review
router.put("/api/reviews/:id", async (req, res) => {
  const reviewId = req.params.id;
  const newData = req.body;
  try {
    const updatedReview = await Review.findByPk(reviewId);
    if (!updatedReview) throw new Error('Review not found');
    await updatedReview.update(newData);
    res.json(updatedReview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// DELETE a review
router.delete("/api/reviews/:id", async (req, res) => {
    const reviewId = req.params.id;
    try {
      const review = await Review.findByPk(reviewId);
      if (!review) throw new Error('Review not found');
      
      // Menonaktifkan review
      await review.update({ status: 'inactive' });
      
      res.json(review);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to delete review' });
    }
});

module.exports = router;
