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

route.get("/getMoneykasheer/:id", async (req, res) => {
  const kasheerName = req.params.id;

  try {
    const kasheer = await KasheerModel.findOne({ name: kasheerName }).maxTimeMS(
      20000
    );
    const data = kasheer.money;
    const token = jwt.sign({ data }, config.secretKey);
    res.json({ token, data });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

route.get("/getInvoicekasheer/:id", async (req, res) => {
  const kasheerName = req.params.id;

  try {
    const kasheer = await KasheerModel.findOne({ name: kasheerName }).maxTimeMS(
      20000
    );
    const data = kasheer.orders;
    const token = jwt.sign({ data }, config.secretKey);
    res.json({ token, data });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
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
      colorCompany: Kasheer.colorCompany,
      phoneCompany: Kasheer.phoneCompany,
      answer: "yes",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("error");
  }
});

route.post("/addkasheer", async (req, res) => {
  const {
    name,
    phone,
    imageURL,
    password,
    selectedStore,
    selectedMoneySafe,
    phoneCompany,
    colorkasheer,
  } = req.body;

  const kasheer = await KasheerModel.findOne({ name: name });
  if (kasheer) {
    return res.send("no");
  }
  const hashedPassword = await bcyrbt.hash(password, saltRounds);
  const newkasheer = new KasheerModel({
    name: name,
    phone: phone,
    phoneCompany: phoneCompany,
    colorCompany: colorkasheer,
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
      phoneCompany,
      colorkasheer,
    } = req.body;

    const kasheer = await KasheerModel.findById(id);
    const hashedPassword = await bcyrbt.hash(password, saltRounds);

    kasheer.name = name;
    kasheer.phone = phone;
    kasheer.phoneCompany = phoneCompany;
    kasheer.colorCompany = colorkasheer;
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

route.post("/orderInvoice", async (req, res) => {
  const {
    products,
    size,
    amount,
    deduct,
    store,
    moneySafe,
    pos,
    priceProducts,
  } = req.body;

  const kasheer = await KasheerModel.findOne({ name: pos });

  const newOrder = {
    products: products.map((item) => ({
      Idproduct: item.idProduct,
      nameProduct: item.nameProduct,
      sizeProduct: size[item.idProduct]?.anchorKey,
      amountProduct: amount[item.idProduct],
      priceProduct: item.priceProduct,
    })),
    totalPrice: priceProducts,
    deduct: deduct,
    dateInvoice: new Date().toLocaleDateString(),
    timeInvoice: new Date().toLocaleTimeString(),
  };

  kasheer.orders.push(newOrder);

  kasheer.money.push({
    idInvoice: kasheer.orders[kasheer.orders.length - 1]._id,
    deduct: deduct || 0,
    money: priceProducts || 0,
    notes: "لا يوجد ملاحظات",
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
    acceptMoney: true,
  });

  const save = await kasheer.save();
  if (save) {
    return res.send("yes");
  }
  // console.error(error);
  // return res.status(500).send("حدث خطأ أثناء حفظ المستخدم");
});

module.exports = route;
