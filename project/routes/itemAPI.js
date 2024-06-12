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

// relation
Menu.belongsToMany(Item, {
  through: MenuItem,
  foreignKey: "menu_id",
});

Item.belongsToMany(Menu, {
  through: MenuItem,
  foreignKey: "item_id",
});

// func pembantu
async function kurangiApiHit(owner) {
  let update = await owner.update({
    api_hit: owner.api_hit - 1,
  });
}

async function cekBahan(bahan, resto) {
  const schema = Joi.object({
    item_id: Joi.number().required().messages({
      "any.required": "Semua field bahan wajib diisi",
    }),
    needed_quantity: Joi.number().min(1).required().messages({
      "any.required": "Semua field bahan wajib diisi",
      "number.min": "{{#label}} minimal 1",
    }),
  });

  try {
    for (let i = 0; i < bahan.length; i++) {
      const e = bahan[i];
      await schema.validateAsync(e);
      let item = await Item.findOne({
        where: {
          item_id: e.item_id,
          restaurant_id: resto.restaurant_id,
          status: "active",
        },
      });

      if (!item) {
        throw new Error("Bahan dengan id " + e.item_id + " tidak ditemukan");
      }
    }
  } catch (error) {
    throw error;
  }
}

async function cekMenu(menu, resto) {
  const schema = Joi.object({
    menu_id: Joi.number().required().messages({
      "any.required": "Semua field menu wajib diisi",
    }),
    needed_quantity: Joi.number().min(1).required().messages({
      "any.required": "Semua field qty wajib diisi",
      "number.min": "{{#label}} minimal 1",
    }),
  });

  let hasil = [];

  try {
    for (let i = 0; i < menu.length; i++) {
      const e = menu[i];
      await schema.validateAsync(e);
      let item = await Menu.findOne({
        where: {
          menu_id: e.menu_id,
          restaurant_id: resto.restaurant_id,
          status: "active",
        },
      });

      if (!item) {
        throw new Error("Menu dengan id " + e.menu_id + " tidak ditemukan");
      }

      hasil.push({
        menu_id: parseInt(e.menu_id),
        harga_menu: item.harga_menu,
        needed_quantity: parseInt(e.needed_quantity),
      });
    }
    return hasil;
  } catch (error) {
    throw error;
  }
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

  let pwd = await bcrypt.compare(password, user.password);
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

async function checkLoginMember(req, res, next) {
  const { username, password } = req.body;
  if (username && password) {
    let user = await Member.findOne({ where: { username: username } });
    if (user) {
      let pwd = await bcrypt.compare(password, user.password);
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
    let { nama_menu, deskripsi_menu, harga_menu, bahan } = req.body;

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
      bahan: Joi.required().messages({
        "any.required": "Field tidak boleh kosong!",
      }),
    });
    try {
      await schema.validateAsync({
        nama_menu,
        deskripsi_menu,
        harga_menu,
        bahan,
      });
    } catch (error) {
      let code = 400;
      let errorMsg = error.toString().split(": ")[1];
      errorMsg = errorMsg.split(" (")[0];
      return res.status(code).json({
        messages: errorMsg,
      });
    }

    let resto = req.body.resto;
    //cek bahan-bahan
    if (Array.isArray(bahan)) {
      try {
        await cekBahan(bahan, resto);
      } catch (error) {
        let code = 400;
        let errorMsg = error.toString().split(": ")[1];
        errorMsg = errorMsg.split(" (")[0];
        if (errorMsg.includes("Bahan tidak ditemukan")) code = 404;
        return res.status(code).json({
          messages: errorMsg,
        });
      }
    } else {
      return res
        .status(400)
        .json({ message: "bahan harus dalam bentuk array" });
    }

    let newItem = await Menu.create({
      nama_menu: nama_menu,
      deskripsi_menu: deskripsi_menu,
      harga_menu: harga_menu,
      restaurant_id: resto.restaurant_id,
    });
    let new_menu_id = newItem.menu_id;
    // console.log(new_menu_id);

    for (let i = 0; i < bahan.length; i++) {
      const e = bahan[i];

      let menu_item = await MenuItem.create({
        menu_id: new_menu_id,
        restaurant_id: resto.restaurant_id,
        item_id: e.item_id,
        needed_quantity: e.needed_quantity,
      });
    }

    if (newItem) {
      //kurangi api
      await kurangiApiHit(req.body.owner);

      return res
        .status(201)
        .json({ message: "berhasil menambahkan menu " + newItem.nama_menu });
    } else {
      return res
        .status(400)
        .json({ message: "gagal create menu " + newItem.nama_menu });
    }
  }
);

// update bahan menu (delete + add)
router.put(
  "/api/v1/menus/:id/items",
  [checkApiKey, checkLoginAdmin, checkApiHit],
  async function (req, res) {
    let { action, bahan } = req.body;
    const { id } = req.params;

    const schema = Joi.object({
      bahan: Joi.required().messages({
        "any.required": "Field tidak boleh kosong!",
      }),
      action: Joi.string().required().valid("update", "delete").messages({
        "any.required": "Field tidak boleh kosong!",
        "string.empty": "Field tidak boleh kosong!",
        "any.only": "action harus update atau delete",
      }),
    });
    try {
      await schema.validateAsync({
        bahan,
        action,
      });
    } catch (error) {
      let code = 400;
      let errorMsg = error.toString().split(": ")[1];
      errorMsg = errorMsg.split(" (")[0];
      return res.status(code).json({
        messages: errorMsg,
      });
    }

    let resto = req.body.resto;

    //cek bahan-bahan
    if (Array.isArray(bahan)) {
      try {
        await cekBahan(bahan, resto);
      } catch (error) {
        let code = 400;
        let errorMsg = error.toString().split(": ")[1];
        errorMsg = errorMsg.split(" (")[0];
        if (errorMsg.includes("Bahan tidak ditemukan")) code = 404;
        return res.status(code).json({
          messages: errorMsg,
        });
      }
    } else {
      return res
        .status(400)
        .json({ message: "bahan harus dalam bentuk array" });
    }

    let currMenu = await Menu.findOne({
      where: {
        menu_id: id,
        restaurant_id: resto.restaurant_id,
        status: "active",
      },
    });

    if (!currMenu) {
      return res.status(404).json({ message: "id menu tidak ditemukan" });
    }

    for (let i = 0; i < bahan.length; i++) {
      const e = bahan[i];

      let currMenuItem = await MenuItem.findOne({
        where: {
          menu_id: id,
          restaurant_id: resto.restaurant_id,
          item_id: e.item_id,
        },
      });

      if (action == "update" && !currMenuItem) {
        let menu_item = await MenuItem.create({
          menu_id: id,
          restaurant_id: resto.restaurant_id,
          item_id: e.item_id,
          needed_quantity: e.needed_quantity,
        });
      } else if (action == "update" && currMenuItem) {
        let q = await currMenuItem.update({
          needed_quantity: e.needed_quantity,
        });
      } else if (action == "delete" && currMenuItem) {
        let q = await currMenuItem.destroy();
      } else {
        return res.status(404).json({
          message: "bahan menu yang delete tidak ditemukan",
        });
      }
    }
    //kurangi api
    await kurangiApiHit(req.body.owner);

    return res
      .status(200)
      .json({ message: `berhasil ${action} bahan menu ${currMenu.nama_menu}` });
  }
);

// update menu properti (termasuk status)
router.put(
  "/api/v1/menus/:id",
  [checkApiKey, checkLoginAdmin, checkApiHit],
  async function (req, res) {
    let { nama_menu, deskripsi_menu, harga_menu, status } = req.body;
    const { id } = req.params;
    const schema = Joi.object({
      nama_menu: Joi.string().messages({
        "string.empty": "Field tidak boleh kosong!",
      }),
      deskripsi_menu: Joi.string().messages({
        "string.empty": "Field tidak boleh kosong!",
      }),
      harga_menu: Joi.number().min(1000).messages({
        "number.min": "{{#label}} minimal 1000",
      }),
      status: Joi.string().valid("active", "habis", "inactive").messages({
        "string.empty": "Field tidak boleh kosong!",
        "any.only": "status harus active, habis, atau inactive",
      }),
    });
    try {
      await schema.validateAsync({
        nama_menu,
        deskripsi_menu,
        harga_menu,
        status,
      });
    } catch (error) {
      let code = 400;
      let errorMsg = error.toString().split(": ")[1];
      errorMsg = errorMsg.split(" (")[0];
      return res.status(code).json({
        messages: errorMsg,
      });
    }

    let resto = req.body.resto;

    let currMenu = null;

    if (status) {
      currMenu = await Menu.findOne({
        where: {
          menu_id: id,
          restaurant_id: resto.restaurant_id,
        },
      });
    } else {
      currMenu = await Menu.findOne({
        where: {
          menu_id: id,
          restaurant_id: resto.restaurant_id,
          status: "active",
        },
      });
    }

    if (!currMenu) {
      return res.status(404).json({ message: "id menu tidak ditemukan" });
    }

    if (!nama_menu) {
      nama_menu = currMenu.nama_menu;
    }
    if (!deskripsi_menu) {
      deskripsi_menu = currMenu.deskripsi_menu;
    }
    if (!harga_menu) {
      harga_menu = currMenu.harga_menu;
    }
    if (!status) {
      status = currMenu.status;
    }

    // update
    let update = await currMenu.update({
      nama_menu: nama_menu,
      deskripsi_menu: deskripsi_menu,
      harga_menu: harga_menu,
      status: status,
    });

    await kurangiApiHit(req.body.owner);

    return res
      .status(200)
      .json({ message: "berhasil update menu " + currMenu.nama_menu });
  }
);

// get all menu (bisa custom)
router.get(
  "/api/v1/menus",
  [checkApiKey, checkApiHit],
  async function (req, res) {
    let { nama_menu, harga_menu, status } = req.query;
    let resto = req.body.resto;

    const schema = Joi.object({
      nama_menu: Joi.string().messages({
        "string.empty": "Field tidak boleh kosong!",
      }),
      harga_menu: Joi.number().messages({
        "any.required": "Field tidak boleh kosong!",
      }),
      status: Joi.string().valid("active", "habis", "inactive").messages({
        "string.empty": "Field tidak boleh kosong!",
        "any.only": "status harus active, habis, atau inactive",
      }),
    });

    try {
      await schema.validateAsync({
        nama_menu,
        harga_menu,
        status,
      });
    } catch (error) {
      let code = 400;
      let errorMsg = error.toString().split(": ")[1];
      errorMsg = errorMsg.split(" (")[0];
      return res.status(code).json({
        messages: errorMsg,
      });
    }

    if (!status) {
      status = "active";
    }

    if (!nama_menu) {
      nama_menu = "";
    }

    if (!harga_menu) {
      harga_menu = 0;
    }

    let q = await Menu.findAll({
      where: {
        restaurant_id: resto.restaurant_id,
        status: status,
      },
    });

    q = q.filter((m) =>
      m.nama_menu.toLowerCase().includes(nama_menu.toLowerCase())
    );

    q = q.filter((m) => m.harga_menu >= harga_menu);

    return res.status(200).json({
      menu: q,
    });
  }
);

// get menu yang bhnnya nda cukup
router.get(
  "/api/v1/menus/habis",
  [checkApiKey, checkLoginAdmin, checkApiHit],
  async function (req, res) {
    let resto = req.body.resto;

    let menus = await Menu.findAll({
      where: {
        restaurant_id: resto.restaurant_id,
        status: "active",
      },
    });

    let items = await Item.findAll({
      where: {
        restaurant_id: resto.restaurant_id,
        status: "active",
      },
    });

    let temp = [];

    for (let i = 0; i < menus.length; i++) {
      const e = menus[i];

      let q = await Menu.findOne({
        where: {
          menu_id: e.menu_id,
          restaurant_id: resto.restaurant_id,
        },
      });

      let bahanMenu = await q.getItems();

      q = q.dataValues;

      bahanMenu = bahanMenu.filter(
        (m) => m.Menu_item.needed_quantity > m.quantitas
      );

      if (bahanMenu.length > 0) {
        temp.push({
          ...q,
          bahan: bahanMenu.map((b) => {
            return {
              item_id: b.item_id,
              nama_item: b.nama_item,
              needed_quantity: b.Menu_item.needed_quantity,
              stok_perlu_ditambah_sebanyak:
                b.Menu_item.needed_quantity - b.quantitas,
            };
          }),
        });
      }
    }

    return res.status(200).json({
      menu: temp,
    });
  }
);

// get menu by id , keluar bahan" yg diperlukan jg
// buat admin
router.get(
  "/api/v1/menus/:id",
  [checkApiKey, checkLoginAdmin, checkApiHit],
  async function (req, res) {
    const { id } = req.params;
    let resto = req.body.resto;

    let q = await Menu.findOne({
      where: {
        menu_id: id,
        restaurant_id: resto.restaurant_id,
      },
    });

    if (!q) {
      return res.status(404).json({
        messages: "id menu tidak ditemukan",
      });
    }

    let bahan = await q.getItems();
    // console.log(bahan);
    q = q.dataValues;

    return res.status(200).json({
      menu: {
        ...q,
        bahan: bahan.map((m) => {
          return {
            item_id: m.item_id,
            nama_item: m.nama_item,
            needed_quantity: m.Menu_item.needed_quantity,
          };
        }),
      },
    });
  }
);

// delete menu
router.delete(
  "/api/v1/menus/:id",
  [checkApiKey, checkLoginAdmin, checkApiHit],
  async function (req, res) {
    const { id } = req.params;
    let resto = req.body.resto;

    let q = await Menu.findOne({
      where: {
        menu_id: id,
        restaurant_id: resto.restaurant_id,
      },
    });

    if (!q) {
      return res.status(404).json({
        messages: "id menu tidak ditemukan",
      });
    }

    let deleteMenuItem = await MenuItem.destroy({
      where: {
        menu_id: id,
        restaurant_id: resto.restaurant_id,
      },
    });

    let delete_menu = await q.update({
      status: "inactive",
    });

    return res.status(200).json({
      messages: "menu berhasil di delete",
    });
  }
);

// let coba = [
//   {
//     menu_id: 1,
//     needed_quantity: 4,
//   },
// ];
// hitung total harga menu dan jum menu di cart
router.get(
  "/api/v1/cart",
  [checkApiKey, checkLoginMember, checkApiHit],
  async function (req, res) {
    let resto = req.body.resto;
    let owner = req.body.owner;

    let { menus } = req.query;

    // return res.status(200).json(menus);

    const schema = Joi.object({
      menus: Joi.required().messages({
        "any.required": "Field tidak boleh kosong!",
      }),
    });

    try {
      await schema.validateAsync({
        menus,
      });
    } catch (error) {
      let code = 400;
      let errorMsg = error.toString().split(": ")[1];
      errorMsg = errorMsg.split(" (")[0];
      return res.status(code).json({
        messages: errorMsg,
      });
    }
    console.log(menus);
    let isiCart = null;
    //cek bahan-bahan
    if (Array.isArray(menus)) {
      try {
        isiCart = await cekMenu(menus, resto);
      } catch (error) {
        let code = 400;
        let errorMsg = error.toString().split(": ")[1];
        errorMsg = errorMsg.split(" (")[0];
        if (errorMsg.includes("Menu dengan id")) code = 404;
        return res.status(code).json({
          messages: errorMsg,
        });
      }
    } else {
      return res
        .status(400)
        .json({ message: "menu di cart harus dalam bentuk array" });
    }
    // console.log(isiCart);
    let total = 0;
    for (let i = 0; i < isiCart.length; i++) {
      const e = isiCart[i];
      total += e.harga_menu * e.needed_quantity;
    }

    await kurangiApiHit(owner);

    return res.status(200).json({
      cart: {
        jumlah_item: isiCart.length,
        total_harga: total,
      },
    });
  }
);

module.exports = router;
