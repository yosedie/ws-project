const express = require("express");
const Sequelize = require("sequelize");
const router = express.Router();
const { Op } = require("sequelize");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const JWT_KEY = "efgusguygyufegauiahf";
const bcrypt = require("bcrypt");
const Joi = require("joi").extend(require("@joi/date"));
const Restaurant = require("../model/restaurant.js");
const Item = require("../model/item.js");
const Owner = require("../model/owner.js");
const Member = require("../model/member.js");
const Menu = require("../model/menu.js");
const MenuItem = require("../model/menu_item.js");

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

async function checkLoginAdmin(req, res, next) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ messages: "Field can't be empty" });
  }

  let resto = req.body.dataKey;
  let user = await Member.findOne({ where: { username: username } });

  if (!user) {
    return res.status(400).json({ messages: "Username isnt Correct" });
  }

  if (resto.restaurant_id != user.restaurant_id) {
    return res.status(400).json({ messages: "Username tidak ditemukan" });
  }

  let pwd = bcrypt.compare(password, user.password);
  if (pwd) {
    if (user.role != "admin") {
      return res
        .status(403)
        .json({ messages: "not authorized, only admin can access it" });
    }
    req.body.user = user;
    next();
  } else {
    return res.status(400).json({ messages: "Password isnt Correct" });
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

// GET item by id
router.get(
  "/api/v1/items/:id",
  [checkApiKey, checkLoginAdmin, checkApiHit],
  async (req, res) => {
    const { id } = req.params;
    let resto = req.body.dataKey;
    //cari all item
    let activeItems = await Item.findOne({
      where: {
        status: "active",
        restaurant_id: resto.restaurant_id,
        item_id: id,
      },
    });
    if (!activeItems) {
      return res.status(404).json({ messages: "item tidak ditemukan" });
    }

    //kurangi api
    await kurangiApiHit(req.body.owner);

    return res.status(200).json({
      item: activeItems,
    });
  }
);

router.get(
  "/api/v1/items",
  [checkApiKey, checkLoginAdmin, checkApiHit],
  async (req, res) => {
    let { nama } = req.query;
    let resto = req.body.dataKey;
    if (!nama) {
      nama = "";
    }
    //cari all item
    let activeItems = await Item.findAll({
      where: {
        status: "active",
        restaurant_id: resto.restaurant_id,
      },
    });

    //filter
    activeItems = activeItems.filter((i) =>
      i.nama_item.toLowerCase().includes(nama.toLowerCase())
    );

    //kurangi api
    await kurangiApiHit(req.body.owner);

    return res.status(200).json({
      listItem: activeItems,
    });
  }
);

// buat new item
router.post(
  "/api/v1/items",
  [checkApiKey, checkLoginAdmin, checkApiHit],
  async (req, res) => {
    let { nama_item, quantitas, satuan } = req.body;
    const schema = Joi.object({
      nama_item: Joi.string().required().messages({
        "any.required": "Field tidak boleh kosong!",
        "string.empty": "Field tidak boleh kosong!",
      }),
      quantitas: Joi.number().min(1).required().messages({
        "any.required": "Field tidak boleh kosong!",
        "number.min": "{{#label}} minimal 1",
      }),
      satuan: Joi.string().required().messages({
        "any.required": "Field tidak boleh kosong!",
        "string.empty": "Field tidak boleh kosong!",
      }),
    });

    try {
      await schema.validateAsync({
        nama_item,
        quantitas,
        satuan,
      });
    } catch (error) {
      let code = 400;
      let errorMsg = error.toString().split(": ")[1];
      errorMsg = errorMsg.split(" (")[0];
      return res.status(code).json({
        messages: errorMsg,
      });
    }

    const newItem = await Item.create({
      ...req.body,
      restaurant_id: req.body.dataKey.restaurant_id,
    });
    if (newItem) {
      //kurangi api
      await kurangiApiHit(req.body.owner);

      return res
        .status(201)
        .json({ message: "berhasil menambahkan item " + newItem.nama_item });
    } else {
      return res
        .status(400)
        .json({ message: "gagal create item " + newItem.nama_item });
    }
  }
);

// update item
router.put(
  "/api/v1/items/:id",
  [checkApiKey, checkLoginAdmin, checkApiHit],
  async (req, res) => {
    const { id } = req.params;
    let { nama_item, quantitas, satuan } = req.body;
    const schema = Joi.object({
      nama_item: Joi.string().messages({
        "string.empty": "Field tidak boleh kosong!",
      }),
      quantitas: Joi.number().min(1).messages({
        "number.min": "{{#label}} minimal 1",
      }),
      satuan: Joi.string().messages({
        "string.empty": "Field tidak boleh kosong!",
      }),
    });

    try {
      await schema.validateAsync({
        nama_item,
        quantitas,
        satuan,
      });
    } catch (error) {
      let code = 400;
      let errorMsg = error.toString().split(": ")[1];
      errorMsg = errorMsg.split(" (")[0];
      return res.status(code).json({
        messages: errorMsg,
      });
    }

    const item = await Item.findByPk(id);

    if (!item) {
      return res.status(404).json({ messages: "item tidak ditemukan" });
    }

    if (item.status == "inactive") {
      return res.status(404).json({ messages: "item tidak ditemukan" });
    }

    if (!nama_item) {
      nama_item = item.nama_item;
    }
    if (!quantitas) {
      quantitas = item.quantitas;
    }
    if (!satuan) {
      satuan = item.satuan;
    }

    // Update data item
    let update = await item.update({
      nama_item: nama_item,
      quantitas: quantitas,
      satuan: satuan,
    });

    //kurangi api
    await kurangiApiHit(req.body.owner);

    return res
      .status(200)
      .json({ messages: "berhasil update " + item.nama_item });
  }
);

// DELETE an item (set status to inactive)
router.delete(
  "/api/v1/items/:id",
  [checkApiKey, checkLoginAdmin, checkApiHit],
  async (req, res) => {
    const itemId = req.params.id;
    try {
      const item = await Item.findByPk(itemId);
      if (!item) {
        return res.status(404).json({ messages: "item tidak ditemukan" });
      }

      // Menonaktifkan item dengan mengubah statusnya menjadi 'inactive'
      await item.update({ status: "inactive" });

      //kurangi api
      await kurangiApiHit(req.body.owner);

      return res
        .status(200)
        .json({ messages: "berhasil delete " + item.nama_item });
    } catch (error) {
      console.error(error);
      return res.status(400).json({ messages: "gagal delete item" });
    }
  }
);

//end point untuk menu
//buat menu baru
router.post(
  "/api/v1/menus",
  [checkApiKey, checkLoginAdmin, checkApiHit],
  async function (req, res) {
    let { nama_menu, deskripsi_menu, harga_menu } = req.body;

    const schema = Joi.object({
      nama_menu: Joi.string().required().messages({
        "any.required": "Field tidak boleh kosong!",
        "string.empty": "Field tidak boleh kosong!",
      }),
      deskripsi_menu: Joi.string().required().messages({
        "any.required": "Field tidak boleh kosong!",
        "string.empty": "Field tidak boleh kosong!",
      }),
      harga_menu: Joi.number().min(1000).required().messages({
        "any.required": "Field tidak boleh kosong!",
        "number.min": "{{#label}} minimal 1000",
      }),
    });

    try {
      await schema.validateAsync(req.body);
    } catch (error) {
      let code = 400;
      let errorMsg = error.toString().split(": ")[1];
      errorMsg = errorMsg.split(" (")[0];
      return res.status(code).json({
        messages: errorMsg,
      });
    }

    let resto = req.body.resto;
    let newItem = await Menu.create({
      nama_menu: nama_menu,
      deskripsi_menu: deskripsi_menu,
      harga_menu: harga_menu,
      restaurant_id: resto.restaurant_id,
    });

    if (newItem) {
      //kurangi api
      await kurangiApiHit(req.body.owner);

      return res
        .status(201)
        .json({ message: "berhasil menambahkan item " + newItem.nama_menu });
    } else {
      return res
        .status(400)
        .json({ message: "gagal create item " + newItem.nama_menu });
    }
  }
);

module.exports = router;
