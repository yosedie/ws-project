const express = require("express");
const Sequelize = require("sequelize");
const router = express.Router();
const { Op } = require("sequelize");
const axios = require("axios");
const Owner = require("../model/owner.js");
const Member = require("../model/member.js");
const Restaurant = require("../model/restaurant.js");
const Kupon = require("../model/kupon.js");
const H_trans = require("../model/h_trans.js");
const Item = require("../model/item.js");
const jwt = require("jsonwebtoken");
const JWT_KEY = "efgusguygyufegauiahf";
const bcrypt = require("bcrypt");
const Joi = require("joi").extend(require("@joi/date"));

async function checkApiKey(req, res, next) {
    const api_key = req.header("Authorization");
    let valid = await Restaurant.findOne({ where: { api_key: api_key.slice(7) } });
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

 // Sum grand_total transaction [ADMIN]
 router.get('/api/sumTransaction', [checkApiKey, checkLogin], async (req, res) => {
    try {
        const transactions = await H_trans.findAll({
            where: {
                restaurant_id: req.body.restaurant.restaurant_id
            }
        });

        let grandTotal = transactions.reduce((sum, trans) => sum + trans.grand_total, 0);

        return res.json({ "Restaurant Name": req.body.restaurant.nama_restaurant, "Transaction Grand Total": grandTotal });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

 // Get all customer success transaction [ADMIN]
 router.get('/api/customerTransaction', [checkApiKey, checkLogin], async (req, res) => {
    try {
        const restaurantId = req.body.restaurant.restaurant_id;
        const transactions = await H_trans.findAll({
            where: {
                restaurant_id: restaurantId,
                status_transaksi: 3
            }
        });

        const restaurant = await Restaurant.findOne({
            where: {
                restaurant_id: restaurantId
            },
            attributes: ['nama_restaurant']
        });

        const memberIds = transactions.map(trans => trans.member_id);
        const members = await Member.findAll({
            where: {
                member_id: memberIds
            },
            attributes: ['member_id', 'nama_member']
        });

        const memberMap = {};
        members.forEach(member => {
            memberMap[member.member_id] = member.nama_member;
        });

        const result = transactions.map(trans => ({
            "Restaurant Name": restaurant.nama_restaurant,
            "Member Name": memberMap[trans.member_id] || 'Unknown',
            "Subtotal": trans.subtotal,
            "Grand Total": trans.grand_total
        }));

        if(result.length !== 0) {
            return res.json(result);
        }
        return res.json({message: `Empty customer transaction on ${restaurant.nama_restaurant} restaurant`});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

 // Checkout [Member / Customer]
 router.post('/api/checkout', [checkLoginMember, checkApiKey], async (req, res) => {
    try {
        const restaurantId = req.body.restaurant.restaurant_id;
        const transactions = await H_trans.findAll({
            where: {
                member_id: req.body.user.member_id,
                status_transaksi: {
                    [Op.or]: [0, 2]
                }
            }
        });

        const restaurant = await Restaurant.findOne({
            where: {
                restaurant_id: restaurantId
            },
            attributes: ['nama_restaurant']
        });

        let core = new midtransClient.CoreApi({
            isProduction: false,
            serverKey: "SB-Mid-server-CKp9TOLZwarw9yQJmntI30yh",
            clientKey: "SB-Mid-client-t9vamsHp5lVGoR8Z"
        });

        const results = await Promise.all(transactions.map(async (trans) => {
            const parameter = {
                card_number: "5264 2210 3887 4659",
                card_exp_month: "12",
                card_exp_year: "2025",
                card_cvv: "123",
                client_key: core.apiConfig.clientKey
            };

            try {
                const cardTokenResponse = await core.cardToken(parameter);
                const chargeParameter = {
                    payment_type: "credit_card",
                    transaction_details: {
                        gross_amount: trans.grand_total,
                        order_id: `SUBSCRIPTION-${Math.floor(Math.random() * 90000000) + 10000000}`
                    },
                    credit_card: {
                        token_id: cardTokenResponse.token_id,
                        authentication: true
                    }
                };

                const chargeResponse = await core.charge(chargeParameter);

                if (chargeResponse.status_code === '201') {
                    return {
                        "Restaurant Name": restaurant.nama_restaurant,
                        "Member Name": req.body.user.nama_member,
                        "Subtotal": trans.subtotal,
                        redirect_url: chargeResponse.redirect_url
                    };
                }
            } catch (e) {
                console.error(e);
                return { error: e.message };
            }
        }));

        return res.json(results.filter(result => !result.error));
    } catch (e) {
        console.error(e);
        return res.status(500).send(e.message);
    }
});

// Show All H Trans status [ADMIN]
router.get('/api/hTransStatus', [checkLogin, checkApiKey], async (req, res) => {
    try {
        const transactions = await H_trans.findAll({
            where: {
                restaurant_id: req.body.restaurant.restaurant_id,
            },
            attributes: ['trans_id', 'status_transaksi', 'grand_total']
        });

        const statusMap = {
            0: 'Created',
            1: 'Payment Completed',
            2: 'Made by Restaurant',
            3: 'Success',
            4: 'Failed'
        };

        const results = transactions.map(trans => ({
            ID: trans.trans_id,
            status: statusMap[trans.status_transaksi] || 'Unknown',
            grand_total: trans.grand_total
        }));

        return res.json(results);
    } catch (e) {
        console.error(e);
        return res.status(500).send(e.message);
    }
});

// Change H Trans status [ADMIN]
router.put('/api/hTransStatus', [checkLogin, checkApiKey], async (req, res) => {
    const { trans_id, status_transaksi } = req.body;
    const schema = Joi.object({
        trans_id: Joi.string().required().messages({
            "any.required": "Field tidak boleh kosong!",
            "string.empty": "Field tidak boleh kosong!",
        }),
        status_transaksi: Joi.number().integer().required().messages({
            "any.required": "Field tidak boleh kosong!",
            "number.base": "Field harus berupa angka!",
        }),
    });

    try {
        await schema.validateAsync({
            trans_id,
            status_transaksi,
        });
    } catch (error) {
        let statusCode = 400;
        return res.status(statusCode).send(error.toString());
    }

    try {
        const transaction = await H_trans.findOne({ where: { trans_id } });

        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        transaction.status_transaksi = status_transaksi;
        await transaction.save();

        return res.json({
            message: "Transaction status updated successfully",
        });
    } catch (e) {
        console.error(e);
        return res.status(500).send(e.message);
    }
});

// Sum restaurant income [ADMIN]
router.get('/api/sumIncome', [checkApiKey, checkLogin], async (req, res) => {
    try {
        const transactions = await H_trans.findAll({
            where: {
                restaurant_id: req.body.restaurant.restaurant_id,
                status_transaksi: 3,
            }
        });

        let grandTotalIncome = transactions.reduce((sum, trans) => sum + trans.grand_total, 0);

        return res.json({ "Restaurant Name": req.body.restaurant.nama_restaurant, "Restaurant Income": grandTotalIncome });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

// Topup api hit / subscription [ADMIN]
router.post('', [checkApiKey, checkLogin], async (req, res) => {
    const { rupiah } = req.body;
    const schema = Joi.object({
        rupiah: Joi.number().integer().min(5).required().messages({
            "any.required": "Field tidak boleh kosong!",
            "number.base": "Field harus berupa angka!",
            "number.min": "Field harus bernilai minimal 5!"
        }),
    });

    try {
        await schema.validateAsync({
            rupiah,
        });
    } catch (error) {
        let statusCode = 400;
        return res.status(statusCode).send(error.toString());
    }

    try {
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

let loggedUser

// Api topup for admin
router.post("/api/topup", [checkLogin], async (req, res) => {
  const { rupiah } = req.body
  const midtransClient = require('midtrans-client');

  if (!rupiah || parseInt(rupiah) <= 4) {
    return res.status(500).send("Invalid buy amount");
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

    core.cardToken(parameter)
      .then((cardTokenResponse) => {
        const parameter = {
            "payment_type": "credit_card",
            "transaction_details": {
                "gross_amount": rupiah,
                "order_id": `TOPUP-${Math.floor(Math.random() * 90000000) + 10000000}`,
            },
            "credit_card":{
                "token_id": cardTokenResponse.token_id,
                "authentication": true
            }
        };
        return core.charge(parameter);
      })
      .then((e) => {
        if(e.status_code == '201') {
          const {owner_id, api_hit} = {...req.body.user.dataValues}
          loggedUser = {owner_id, api_hit}
          console.log(loggedUser)
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
        const validationMessages = e.validation_messages || [];
        const errorMessage = validationMessages.join(', ');
        return res.status(400).json({ error: errorMessage });
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

// Midtrans response webhook
router.post('/payment-webhook', async (req, res) => {
  const paymentInfo = req.body;
  if (paymentInfo.transaction_status === 'capture') {
    if (paymentInfo.order_id.includes("SUBSCRIPTION") && loggedUser) {
      if(Number.isInteger(loggedUser.owner_id) && Number.isInteger(loggedUser.api_hit)) {
        const owner = await Owner.findByPk(loggedUser.owner_id)
        if(owner) {
          owner.api_hit = loggedUser.api_hit + (parseInt(paymentInfo.gross_amount) / 5)
          await owner.save()
        }
      }
    }
  } else {
    console.log("Payment failed!");
  }
  return res.status(200).end();
});

module.exports = router;