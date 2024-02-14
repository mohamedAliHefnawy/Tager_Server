const express = require("express");
const jwt = require("jsonwebtoken");
const config = require("../config");
const route = express.Router();
const StoresModel = require("../models/store");
const ProductsModel = require("../models/products");

route.get("/getStores", async (req, res) => {
  try {
    const stores = await StoresModel.find().maxTimeMS(20000);
    const token = jwt.sign({ stores }, config.secretKey);
    res.json({ token, stores });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

route.post("/addStore", async (req, res) => {
  try {
    const { nameStore, gbsStore, priceDelivery } = req.body;

    const store = await StoresModel.findOne({ name: nameStore });
    if (store) {
      return res.status(200).send("nameUse");
    }
    const newStore = new StoresModel({
      name: nameStore,
      gbs: gbsStore,
      priceDelivery: +priceDelivery,
    });
    await newStore.save();
    return res.status(200).send("yes");
  } catch (error) {
    console.error(error);
    return res.status(500).send("no");
  }
});

route.post("/editStore", async (req, res) => {
  try {
    const { idStoree, nameStore, gbsStore, priceDelivery } = req.body;

    const store = await StoresModel.findOne({ _id: idStoree });

    store.name = nameStore;
    store.gbs = gbsStore;
    store.priceDelivery = +priceDelivery;

    await store.save();
    return res.status(200).send("yes");
  } catch (error) {
    return res.status(500).send("no");
  }
});

route.get("/getProductsInStore/:id", async (req, res) => {
  try {
    const storeId = req.params.id;
    const store = await StoresModel.findById(storeId);

    const productIds = store.products.flatMap((product) => product);

    let combinedProducts2 = [];

    for (const productId of store.products) {
      const product = await ProductsModel.findById(productId);

      if (product) {
        // إذا كان المنتج ليس بالفعل موجود في المصفوفة، قم بإضافته
        if (
          !combinedProducts2.some(
            (p) => p._id.toString() === product._id.toString()
          )
        ) {
          combinedProducts2.push(product);
        }
      } else {
        const product2 = await ProductsModel.find({
          products: {
            $elemMatch: {
              _id: productId,
            },
          },
        });

        const filteredProducts = await Promise.all(
          product2.map(async (item) => {
            const filtered = item.products.filter((product) =>
              productIds.includes(product._id.toString())
            );
            return filtered;
          })
        ).then((arrays) => arrays.flat());

        // إضافة المنتجات إلى combinedProducts2 إذا لم تكن بالفعل موجودة
        filteredProducts.flat().forEach((p) => {
          if (
            !combinedProducts2.some(
              (existingProduct) =>
                existingProduct._id.toString() === p._id.toString()
            )
          ) {
            combinedProducts2.push(p);
          }
        });
      }
    }

    const final = combinedProducts2.flatMap((item) => item);
    console.log(final);

    // console.log(final);
    const Store = store.gbs;
    const token = jwt.sign({ final, Store }, config.secretKey);
    res.json({ token, final, Store });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = route;
