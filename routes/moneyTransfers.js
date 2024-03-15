const express = require("express");
const jwt = require("jsonwebtoken");
const config = require("../config");
const route = express.Router();
const bcyrbt = require("bcrypt");
const saltRounds = 10;
const MoneyTransfersModel = require("../models/moneyTransfers");
const UsersModel = require("../models/users");

route.get("/getMoneyTransfers", async (req, res) => {
  try {
    const moneyTransfers = await MoneyTransfersModel.find().maxTimeMS(20000);
    const token = jwt.sign({ moneyTransfers }, config.secretKey);
    res.json({ token, moneyTransfers });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

route.post("/addMoneyTransfer", async (req, res) => {
  const { nameTransfer, validityTransfer, date, time, money } = req.body;

  const newMoneyTransfer = new MoneyTransfersModel({
    nameTransfer,
    validityTransfer,
    date,
    time,
    money,
  });

  const nameDelivery = await UsersModel.findOne({ name: nameTransfer });

  await UsersModel.updateMany(
    { "money._id": { $in: nameDelivery.money.map((item) => item._id) } },
    { $set: { "money.$[].acceptMoney": false } }
  );

  const save = await newMoneyTransfer.save();
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

module.exports = route;
