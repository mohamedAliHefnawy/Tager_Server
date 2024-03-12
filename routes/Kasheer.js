const express = require("express");
const jwt = require("jsonwebtoken");
const config = require("../config");
const route = express.Router();
const bcyrbt = require("bcrypt");
const saltRounds = 10;
const KasheerModel = require("../models/kasheer");

route.get("/getkasheer", async (req, res) => {
  try {
    const kasheer = await KasheerModel.find().maxTimeMS(20000);
    const token = jwt.sign({ kasheer }, config.secretKey);
    res.json({ token, kasheer });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

route.post("/addkasheer", async (req, res) => {
  const { name, phone, imageURL, password, selectedStore, selectedMoneySafe } =
    req.body;

  console.log(
    name,
    phone,
    imageURL,
    password,
    selectedStore,
    selectedMoneySafe
  );

  const kasheer = await KasheerModel.findOne({ name: name });
  if (kasheer) {
    return res.send("no");
  }
  const hashedPassword = await bcyrbt.hash(password, saltRounds);
  const newkasheer = new KasheerModel({
    name: name,
    phone: phone,
    password: hashedPassword,
    image: imageURL,
    store: selectedStore,
    moneysafe: selectedMoneySafe,
    validity: "كاشير",
    money: [],
    orders: [],
  });

  const save = await newkasheer.save();
  if (save) {
    return res.send("yes");
  }
  console.error(error);
  return res.status(500).send("حدث خطأ أثناء حفظ المستخدم");
});

route.post("/editkasheer", async (req, res) => {
  try {
    const {
      id,
      name,
      phone,
      imageURL,
      password,
      selectedStore,
      selectedMoneySafe,
    } = req.body;

    const kasheer = await KasheerModel.findById(id);
    const hashedPassword = await bcyrbt.hash(password, saltRounds);

    kasheer.name = name;
    kasheer.phone = phone;
    kasheer.image = imageURL;
    kasheer.password = hashedPassword;
    kasheer.moneysafe = selectedMoneySafe;
    kasheer.store = selectedStore;

    await kasheer.save();
    return res.status(200).send("yes");
  } catch (error) {
    return res.status(500).send("no");
  }
});

route.post("/login", async (req, res) => {
  const { name, password } = req.body;
  try {
    const Kasheer = await KasheerModel.findOne({ name });
    if (!Kasheer) {
      return res.send("notFoundKasheer");
    }
    const comparePassword = await bcyrbt.compare(password, Kasheer.password);
    if (!comparePassword) {
      return res.send("no");
    }

    return res.send({
      validity: Kasheer.validity,
      store: Kasheer.store,
      moneysafe: Kasheer.moneysafe,
      answer: "yes",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("error");
  }
});

module.exports = route;
