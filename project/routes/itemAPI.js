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

// middleware
async function checkApiKey(req, res, next) {
  const api_key = req.header("Authorization");
  if (!api_key) {
    return res.status(400).json({ messages: "api_key harus diisi" });
  }
  try {
    const activeItems = await Item.findAll({
      where: { status: "active" },
    });
    res.json(activeItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve active items" });
  }
}

// POST a new item
router.post("/api/items", async (req, res) => {
  const { error } = itemSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const newItem = await Item.create(req.body);
    res.status(201).json(newItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// PUT update an existing item
router.put("/api/items/:id", async (req, res) => {
  const itemId = req.params.id;
  const { error } = itemSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const item = await Item.findByPk(itemId);
    if (!item) throw new Error("Item not found");

    // Update data item
    await item.update(req.body);

    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update item" });
  }
});

// DELETE an item (set status to inactive)
router.delete("/api/items/:id", async (req, res) => {
  const itemId = req.params.id;
  try {
    const item = await Item.findByPk(itemId);
    if (!item) throw new Error("Item not found");

    // Menonaktifkan item dengan mengubah statusnya menjadi 'inactive'
    await item.update({ status: "inactive" });

    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete item" });
  }
});

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

module.exports = router;
