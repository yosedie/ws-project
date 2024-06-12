const express = require("express");
const Sequelize = require("sequelize");
const router = express.Router();
const { Op } = require("sequelize");
const axios = require("axios");
const Review = require("../model/review.js");
const jwt = require("jsonwebtoken");
const JWT_KEY = "efgusguygyufegauiahf";
const bcrypt = require("bcrypt");
const Joi = require("joi").extend(require("@joi/date"));

// Define Joi schema for review
const reviewSchema = Joi.object({
  restaurant_id: Joi.number().integer().required(),
  member_id: Joi.number().integer().required(),
  comment: Joi.string().required(),
  status: Joi.string().valid("active", "inactive").optional(),
});

// GET all active reviews
router.get("/api/reviews", async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: {
        status: "active",
      },
    });
    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get reviews" });
  }
});

// GET a review by ID
router.get("/api/reviews/:id", async (req, res) => {
  const reviewId = req.params.id;
  try {
    const review = await Review.findByPk(reviewId);
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }
    res.json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get review" });
  }
});

// POST a new review
router.post("/api/reviews", async (req, res) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const newReview = await Review.create(req.body);
    res.status(201).json(newReview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create review" });
  }
});

// PUT update a review
router.put("/api/reviews/:id", async (req, res) => {
  const reviewId = req.params.id;
  const { error } = reviewSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const review = await Review.findByPk(reviewId);
    if (!review) throw new Error("Review not found");

    // Update data review
    await review.update(req.body);

    res.json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update review" });
  }
});

// DELETE a review (set status to inactive)
router.delete("/api/reviews/:id", async (req, res) => {
  const reviewId = req.params.id;
  try {
    const review = await Review.findByPk(reviewId);
    if (!review) throw new Error("Review not found");

    // Menonaktifkan review
    await review.update({ status: "inactive" });

    res.json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete review" });
  }
});

module.exports = router;
