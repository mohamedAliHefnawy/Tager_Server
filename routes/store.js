const express = require("express");
const jwt = require("jsonwebtoken");
const config = require("../config");
const route = express.Router();
const StoresModel = require("../models/store");

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

module.exports = route;
