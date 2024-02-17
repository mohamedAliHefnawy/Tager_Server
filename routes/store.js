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
    const Store = store.gbs;
    const token = jwt.sign({ final, Store }, config.secretKey);
    res.json({ token, final, Store });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

route.post("/convertProductsBetweenStores", async (req, res) => {
  try {
    const { inputValues, storeWith } = req.body;
    for (const [productId, { size, store, amount }] of Object.entries(
      inputValues
    )) {
      const product = await ProductsModel.findById(productId);
      const storeTo = await StoresModel.findOne({ gbs: store[0] });

      if (product) {
        const newSize = product.size.map((sizeItem) => {
          if (sizeItem.size === size[0]) {
            const storeToUpdate = sizeItem.store.find(
              (storeItem) => storeItem.nameStore === storeWith
            );

            if (storeToUpdate) {
              storeToUpdate.amount -= parseInt(amount, 10);
            }
          }
          return sizeItem;
        });

        if (storeTo) {
          if (!store.products.includes(productId)) {
            store.products.push(productId);
            await storeTo.save();
          } else {
            console.log(`already ProductIs`);
          }
        } else {
          console.error(`المخزن ${storeName} غير موجود.`);
        }

        await ProductsModel.findByIdAndUpdate(
          productId,
          { size: newSize },
          { new: true }
        );
      } else {
        const product2 = await ProductsModel.findOne({
          "products._id": productId,
        });

        if (product2) {
          const productToUpdate = product2.products.find(
            (item) => item._id.toString() === productId
          );

          const newSize = productToUpdate.size.map((sizeItem) => {
            if (sizeItem.size === size[0]) {
              const storeToUpdate = sizeItem.store.find(
                (storeItem) => storeItem.nameStore === storeWith
              );

              if (storeToUpdate) {
                storeToUpdate.amount -= parseInt(amount, 10);
              }
            }

            return sizeItem;
          });

          if (storeTo) {
            if (!store.products.includes(productId)) {
              store.products.push(productId);
              await storeTo.save();
            } else {
              console.log(`already ProductIs`);
            }
          } else {
            console.error(`المخزن ${storeName} غير موجود.`);
          }

          await ProductsModel.updateOne(
            { "products._id": productId },
            { $set: { "products.$.size": newSize } }
          );
        } else {
          console.log("المنتج غير موجود");
        }
      }
    }

    const token = jwt.sign({ final, Store }, config.secretKey);
    res.json({ token, final, Store });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = route;
