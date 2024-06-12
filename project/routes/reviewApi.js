const express = require("express");
const Sequelize = require("sequelize");
const router = express.Router();
const { Op } = require("sequelize");
const axios = require("axios");
const Owner = require("../model/owner.js");
const Restaurant = require("../model/restaurant.js");
const Member = require("../model/member.js");
const Review = require("../model/review.js");
const jwt = require("jsonwebtoken");
const JWT_KEY = "efgusguygyufegauiahf";
const bcrypt = require("bcrypt");
const Joi = require("joi").extend(require("@joi/date"));

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

// Define Joi schema for review
const reviewSchema = Joi.object({
  comment: Joi.string().required(),
  status: Joi.string().valid("active", "inactive").optional(),
});

// GET all active reviews
router.get(
  "/api/v1/reviews",
  [checkApiKey, checkLoginMember, checkApiHit],
  async (req, res) => {
    try {
      let resto = req.body.resto;
      let owner = req.body.owner;
      const reviews = await Review.findAll({
        where: {
          restaurant_id: resto.restaurant_id,
          status: "active",
        },
      });
      //kurangi api hit
      await kurangiApiHit(owner);
      res.status(200).json(reviews);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to get reviews" });
    }
  }
);

// GET a review by ID
router.get(
  "/api/v1/reviews/:id",
  [checkApiKey, checkLoginMember, checkApiHit],
  async (req, res) => {
    const reviewId = req.params.id;
    let resto = req.body.resto;
    let owner = req.body.owner;
    try {
      const review = await Review.findOne({
        where: {
          review_id: reviewId,
          restaurant_id: resto.restaurant_id,
        },
      });
      if (!review) {
        return res.status(404).json({ error: "Review not found" });
      }
      //kurangi api hit
      await kurangiApiHit(owner);
      res.status(200).json(review);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: "Failed to get review" });
    }
  }
);

// POST a new review
router.post(
  "/api/v1/reviews",
  [checkApiKey, checkLoginMember, checkApiHit],
  async (req, res) => {
    const { comment, status } = req.body;
    let resto = req.body.resto;
    let owner = req.body.owner;
    let user = req.body.user;
    const { error } = reviewSchema.validate({
      comment,
      status,
    });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    try {
      const newReview = await Review.create({
        comment: comment,
        status: status,
        restaurant_id: resto.restaurant_id,
        member_id: user.member_id,
      });

      await kurangiApiHit(owner);
      res.status(201).json(newReview);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: "Failed to create review" });
    }
  }
);

// PUT update a review
router.put(
  "/api/v1/reviews/:id",
  [checkApiKey, checkLoginMember, checkApiHit],
  async (req, res) => {
    const { comment } = req.body;
    let resto = req.body.resto;
    let owner = req.body.owner;
    const reviewId = req.params.id;
    // schema joi
    const schema = Joi.object({
      comment: Joi.string().required(),
    });
    const { error } = schema.validate({
      comment,
    });

    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
      const review = await Review.findOne({
        where: {
          review_id: reviewId,
          restaurant_id: resto.restaurant_id,
        },
      });
      if (!review) throw new Error("Review not found");

      // Update data review
      await review.update({
        comment: comment,
      });

      await kurangiApiHit(owner);

      res.status(200).json(review);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: "Failed to update review" });
    }
  }
);

// DELETE a review (set status to inactive)
router.delete(
  "/api/v1/reviews/:id",
  [checkApiKey, checkLoginMember, checkApiHit],
  async (req, res) => {
    const reviewId = req.params.id;
    let resto = req.body.resto;
    let owner = req.body.owner;
    try {
      const review = await Review.findOne({
        where: {
          review_id: reviewId,
          restaurant_id: resto.restaurant_id,
        },
      });
      if (!review) throw new Error("Review not found");

      // Menonaktifkan review
      await review.update({ status: "inactive" });

      await kurangiApiHit(owner);
      res.status(200).json(review);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: "Failed to delete review" });
    }
  }
);

module.exports = router;
