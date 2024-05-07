const express = require("express");
const Sequelize = require("sequelize");
const router = express.Router();
const { Op } = require("sequelize");
const Member = require("../model/member.js");
const axios = require("axios");
const Owner = require("../model/owner.js");
const jwt = require("jsonwebtoken");
const JWT_KEY = "efgusguygyufegauiahf";
const bcrypt = require("bcrypt");

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
    let usernamePasswordCheck = Owner.findOne({
      where: { username: username, password: password },
    });
    if (usernamePasswordCheck) {
      req.body.user = usernamePasswordCheck;
      next();
    } else {
      return res
        .status(404)
        .json({ messages: "Username or Password isnt valid" });
    }
  } else {
    return res.status(400).json({ messages: "Field cant be empty" });
  }
}

router.post("/api/register", async (req, res) => {
  const { username, password, name, email, no_telepon } = req.body;
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
    name: Joi.string().required().messages({
      "any.required": "Field tidak boleh kosong!",
      "string.empty": "Field tidak boleh kosong!",
    }),
    email: Joi.email().required().messages({
      "any.email": "Format email harus sesuai",
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

  await Owner.create({
    username,
    password,
    name,
    email,
    no_telepon,
  });
  return res.status(201).json({ messages: "Register Success" });
});

router.post("/api/login", [checkLogin], async (req, res) => {
  const token = jwt.sign(
    {
      username,
      email,
    },
    JWT_KEY,
    {
      expiresIn: "60s",
    }
  );
  return res.status(200).json({ token: token });
});

// router.post("api/subscription", [checkLogin], async (req,res)=>{
//   jwt.verify
// })

function safeStringify(obj) {
  const cache = new Set();
  return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
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


router.post("/api/subscription/charge", async (req, res) => {
  const { buy_amount } = req.body
  const midtransClient = require('midtrans-client');

  if(!buy_amount || parseInt(buy_amount) <= 1) {
    return res.status(500).send("DANCOK KASI BUY AMOUNT DONG")
  }

  try {
    let core = new midtransClient.CoreApi({
      isProduction : false,
      serverKey : 'SB-Mid-server-CKp9TOLZwarw9yQJmntI30yh',
      clientKey : 'SB-Mid-client-t9vamsHp5lVGoR8Z'
    });

    const parameter = {
      'card_number': '5264 2210 3887 4659',
      'card_exp_month': '12',
      'card_exp_year': '2025',
      'card_cvv': '123',
      'client_key': core.apiConfig.clientKey,
    };
    core.cardToken(parameter)
      .then((cardTokenResponse) => {
        const parameter = {
          "payment_type": "credit_card",
          "transaction_details": {
            "gross_amount": buy_amount ?? 1,
            "order_id": `PROYEK-WS-${Math.floor(Math.random() * 90000000) + 10000000}`,
          },
          "credit_card":{
            "token_id": `${cardTokenResponse.token_id}`,
            "authentication": true
          }
        };
        return core.charge(parameter);
      })
      .then((e) => {
        if(e.status_code == '201') {
          return res.status(201).json({
            message: e.status_message,
            status: e.transaction_status,
            redirect_url: e.redirect_url,
          })
        }
        console.log(e)
      })
      .catch((e) => {
        console.log(e)
        return res.status(500).send(e)
      })
  
    // core.charge(parameter)
    // .then((chargeResponse)=>{
    //   console.log('chargeResponse:');
    //   console.log(chargeResponse);
    // });
  } catch(e) {
    return res.status(500).send(e)
  }
})

router.post("/api/subscription/charge", async (req, res) => {
  const { buy_amount } = req.body
  const midtransClient = require('midtrans-client');

  if(!buy_amount || parseInt(buy_amount) <= 1) {
    return res.status(500).send("DANCOK KASI BUY AMOUNT DONG")
  }

  try {
    let core = new midtransClient.CoreApi({
      isProduction : false,
      serverKey : 'SB-Mid-server-CKp9TOLZwarw9yQJmntI30yh',
      clientKey : 'SB-Mid-client-t9vamsHp5lVGoR8Z'
    });

    const parameter = {
      'card_number': '5264 2210 3887 4659',
      'card_exp_month': '12',
      'card_exp_year': '2025',
      'card_cvv': '123',
      'client_key': core.apiConfig.clientKey,
    };
    core.cardToken(parameter)
      .then((cardTokenResponse) => {
        const parameter = {
          "payment_type": "credit_card",
          "transaction_details": {
            "gross_amount": buy_amount ?? 1,
            "order_id": `PROYEK-WS-SUBSCRIPTION-${Math.floor(Math.random() * 90000000) + 10000000}`,
          },
          "credit_card":{
            "token_id": `${cardTokenResponse.token_id}`,
            "authentication": true
          }
        };
        return core.charge(parameter);
      })
      .then((e) => {
        if(e.status_code == '201') {
          return res.status(201).json({
            message: e.status_message,
            status: e.transaction_status,
            redirect_url: e.redirect_url,
          })
        }
        console.log(e)
      })
      .catch((e) => {
        console.log(e)
        return res.status(500).send(e)
      })
  
    // core.charge(parameter)
    // .then((chargeResponse)=>{
    //   console.log('chargeResponse:');
    //   console.log(chargeResponse);
    // });
  } catch(e) {
    return res.status(500).send(e)
  }
})

router.post('/payment-webhook', (req, res) => {
  const paymentInfo = req.body;
  console.log(paymentInfo)
  if (paymentInfo.transaction_status === 'success') {
      console.log('Payment successful!');
  } else {
      console.log('Payment failed!');
  }
  return res.status(200).end();
});

module.exports = router;
