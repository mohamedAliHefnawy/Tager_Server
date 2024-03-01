const express = require("express");
const route = express.Router();
const WithdrawalRequestsModel = require("../models/withdrawalRequests");
const UsersModel = require("../models/users");
const jwt = require("jsonwebtoken");
const config = require("../config");

route.get("/getwithdrawalRequests", async (req, res) => {
  try {
    const withdrawalRequests = await WithdrawalRequestsModel.find().maxTimeMS(
      20000
    );
    const token = jwt.sign({ withdrawalRequests }, config.secretKey);
    res.json({ token, withdrawalRequests });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

route.get("/getpayment/:id", async (req, res) => {
  const paymentId = req.params.id;
  try {
    const payment = await PaymentModel.findById(paymentId);

    if (!payment) {
      return res
        .status(404)
        .json({ message: "لم يتم العثور على بيانات الدفع" });
    }
    res.json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "حدث خطأ أثناء جلب بيانات الدفع" });
  }
});

route.post("/addwithdrawalRequest", async (req, res) => {
  const { money, phoneNumber, selectedValuePayment, marketer } = req.body;

  console.log(marketer);

  const withdrawalRequest = new WithdrawalRequestsModel({
    sumMoney: money,
    marketer: marketer,
    pymentMethod: selectedValuePayment,
    phoneNumber: phoneNumber,
    situation: "في الإنتظار",
  });

  const Marketer = await UsersModel.findOne({ name: marketer });
  Marketer.money.push({
    money: -parseInt(money),
    notes: "",
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
    acceptMoney: true,
  });

  const save1 = await withdrawalRequest.save();
  const save2 = await Marketer.save();

  if (save1 && save2) {
    return res.send("yes");
  }
  console.error(error);
  return res.status(500).send("no");
});

route.post("/editpayment", async (req, res) => {
  try {
    const { id, name, active, image } = req.body;
    const payment = await PaymentModel.findOne({ _id: id });
    payment.name = name;
    payment.active = active;
    payment.image = image;

    await payment.save();
    return res.status(200).send("yes");
  } catch (error) {
    return res.status(500).send("no");
  }
});

route.post("/convertMoney", async (req, res) => {
  try {
    const { nameFrom, nameTo, money, employee } = req.body;
    const paymentTo = await PaymentModel.findOne({ name: nameTo });
    if (!paymentTo) {
      return res.status(404).send("Target payment not found");
    }
    paymentTo.money.push({
      value: money.toString(),
      notes: `من خلال تحويل محفظه ${nameFrom}`,
      person: employee,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    });

    await paymentTo.save();

    const paymentFrom = await PaymentModel.findOne({ name: nameFrom });

    if (!paymentFrom) {
      return res.status(404).send("Source payment not found");
    }
    const totalMoneyFrom = paymentFrom.money.reduce(
      (total, item) => total + +item.value,
      0
    );

    if (totalMoneyFrom < money) {
      return res.status(400).send("Insufficient funds");
    }

    paymentFrom.money.push({
      value: -money.toString(),
      notes: `من خلال تحويل الي محفظه ${nameTo}`,
      person: employee,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    });

    await paymentFrom.save();

    return res.status(200).send("yes");
  } catch (error) {
    console.error(error);
    return res.status(500).send("no");
  }
});

route.post("/addpayment/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { num, notes, person, date, time } = req.body;
    const payment = await PaymentModel.findOne({ _id: id });

    payment.money.push({
      value: num,
      notes: notes || "لا يوجد ملاحظات",
      date: date || "",
      person: person || "-",
      time: time || "",
    });
    await payment.save();
    return res.status(200).send("yes");
  } catch (error) {
    return res.status(500).send("no");
  }
});

module.exports = route;
