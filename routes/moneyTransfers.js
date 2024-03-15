const express = require("express");
const jwt = require("jsonwebtoken");
const config = require("../config");
const route = express.Router();
const bcyrbt = require("bcrypt");
const saltRounds = 10;
const MoneyTransfersModel = require("../models/moneyTransfers");
const UsersModel = require("../models/users");
const PaymentModel = require("../models/payment");
const OrdersModel = require("../models/orders");

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

route.post("/acceptMoney", async (req, res) => {
  try {
    const {
      idOrder,
      idMoney,
      idMoneyTransfer,
      marketer,
      money,
      gainMarketer,
      gainAdmin,
      nameAdmin,
      selectedValuePayment,
    } = req.body;

    const nameMarketer = await UsersModel.findOne({ name: marketer });
    const payment = await PaymentModel.findOne({ name: selectedValuePayment });
    const order = await OrdersModel.findOne({ _id: idOrder });
    const moneyTransfer = await MoneyTransfersModel.findOne({
      _id: idMoneyTransfer,
    });

    nameMarketer.money.push({
      money: +gainMarketer,
      notes: "",
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    });

    payment.money.push({
      value: (+money - +gainAdmin).toString(),
      notes: `أموال طلبية`,
      person: nameAdmin,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    });

    payment.money.push({
      value: gainAdmin.toString(),
      notes: `ربح طلبية`,
      person: nameAdmin,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    });

    order.situationSteps.push({
      situation: "تم إستلام الكاش",
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    });

    moneyTransfer.money = moneyTransfer.money.filter(
      (item) => item._id.toString() !== idMoney
    );

    if (moneyTransfer.money.length === 0) {
      await MoneyTransfersModel.findByIdAndDelete(idMoneyTransfer);
    }

    const save1 = await nameMarketer.save();
    const save2 = await payment.save();
    const save3 = await moneyTransfer.save();
    const save4 = await order.save();

    if (save1 && save2 && save3) {
      return res.status(200).send("yes");
    }
  } catch (error) {
    return res.status(500).send("no");
  }
});

module.exports = route;
