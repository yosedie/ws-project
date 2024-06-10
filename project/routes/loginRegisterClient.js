const express = require("express");
const Sequelize = require("sequelize");
const router = express.Router();
const { Op } = require("sequelize");
const Member = require("../model/member.js");
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
    let code = 400;
    let errorMsg = error.toString().split(": ")[1];
    errorMsg = errorMsg.split(" (")[0];
    return res.status(code).json({
      messages: errorMsg,
    });
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

router.put("/api/restaurant", [checkLogin, checkApiKey], async (req, res) => {
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
    let code = 400;
    let errorMsg = error.toString().split(": ")[1];
    errorMsg = errorMsg.split(" (")[0];
    return res.status(code).json({
      messages: errorMsg,
    });
  }
  let t_nama = null;
  let t_alamat = null;
  let t_deskripsi = null;
  let resto = req.body.restaurant;
  let update = {};
  if (nama_restaurant) {
    t_nama = nama_restaurant;
  } else {
    t_nama = resto.nama;
  }
  if (alamat) {
    t_alamat = alamat;
  } else {
    t_alamat = resto.alamat;
  }
  if (deskripsi) {
    t_deskripsi = deskripsi;
  } else {
    t_deskripsi = resto.deskripsi;
  }

  await Restaurant.update(
    { nama_restaurant: t_nama, alamat: t_alamat, deskripsi: t_deskripsi },
    {
      where: { restaurant_id: resto.restaurant_id },
    }
  );
  return res.status(200).json({ messages: "Berhasil Update data" });
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
    let code = 400;
    let errorMsg = error.toString().split(": ")[1];
    errorMsg = errorMsg.split(" (")[0];
    return res.status(code).json({
      messages: errorMsg,
    });
  }

  let sama = await Restaurant.findOne({
    where: {
      nama_restaurant: nama_restaurant,
      owner_id: req.body.user.owner_id,
    },
  });

  if (!sama) {
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
    return res
      .status(201)
      .json({ messages: "Berhasil menambahkan Restaurant" });
  } else {
    return res.status(400).json({ messages: "Restaurant sudah ada" });
  }
});

router.get("/api/restaurant", [checkLogin], async (req, res) => {
  let resto = await Restaurant.findAll({
    where: { owner_id: req.body.user.owner_id },
  });
  return res.status(200).json({ Restaurant: resto });
});

router.get("/api/client", async (req, res) => {
  let client = await Owner.findAll();
  return res.status(200).json({ client: client });
});

// router.post("api/subscription", [checkLogin], async (req,res)=>{
//   jwt.verify
// })

function safeStringify(obj) {
  const cache = new Set();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (cache.has(value)) {
        // Menghapus referensi siklik
        return;
      }
      // Menyimpan nilai dalam cache
      cache.add(value);
    }
    return value;
  });
}

let loggedUser;
router.post("/api/subscription/charge", [checkLogin], async (req, res) => {
  const { buy_amount } = req.body;
  const midtransClient = require("midtrans-client");

  if (!buy_amount || parseInt(buy_amount) <= 1) {
    return res.status(500).send("DANCOK KASI BUY AMOUNT DONG");
  }

  try {
    let core = new midtransClient.CoreApi({
      isProduction: false,
      serverKey: "SB-Mid-server-CKp9TOLZwarw9yQJmntI30yh",
      clientKey: "SB-Mid-client-t9vamsHp5lVGoR8Z",
    });

    const parameter = {
      card_number: "5264 2210 3887 4659",
      card_exp_month: "12",
      card_exp_year: "2025",
      card_cvv: "123",
      client_key: core.apiConfig.clientKey,
    };

    core
      .cardToken(parameter)
      .then((cardTokenResponse) => {
        const parameter = {
          payment_type: "credit_card",
          transaction_details: {
            gross_amount: buy_amount ?? 1,
            order_id: `SUBSCRIPTION-${
              Math.floor(Math.random() * 90000000) + 10000000
            }`,
          },
        };
        return core.charge(parameter);
      })
      .then((e) => {
        if (e.status_code == "201") {
          const { owner_id, api_hit } = { ...req.body.user.dataValues };
          loggedUser = { owner_id, api_hit };
          return res.status(201).json({
            message: e.status_message,
            status: e.transaction_status,
            redirect_url: e.redirect_url,
          });
        }
        console.log(e);
      })
      .catch((e) => {
        console.log(e);
        return res.status(500).send(e);
      });

    // core.charge(parameter)
    // .then((chargeResponse)=>{
    //   console.log('chargeResponse:');
    //   console.log(chargeResponse);
    // });
  } catch (e) {
    return res.status(500).send(e);
  }
});

router.post("/payment-webhook", async (req, res) => {
  const paymentInfo = req.body;
  if (paymentInfo.transaction_status === "capture") {
    if (paymentInfo.order_id.includes("SUBSCRIPTION") && loggedUser) {
      if (
        Number.isInteger(loggedUser.owner_id) &&
        Number.isInteger(loggedUser.api_hit)
      ) {
        const owner = await Owner.findByPk(loggedUser.owner_id);
        if (owner) {
          owner.api_hit =
            loggedUser.api_hit + parseInt(paymentInfo.gross_amount) / 500;
          await owner.save();
        }
      }
    }
  } else {
    console.log("Payment failed!");
  }
  return res.status(200).end();
});

module.exports = router;
