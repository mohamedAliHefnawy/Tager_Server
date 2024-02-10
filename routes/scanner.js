const express = require("express");
const jwt = require("jsonwebtoken");
const config = require("../config");
const route = express.Router();
const bcyrbt = require("bcrypt");
const saltRounds = 10;
const UsersModel = require("../models/users");
const OrdersModel = require("../models/orders");

route.get("/getOrder/:id", async (req, res) => {
  const orderId = req.params.id;
  // const { deliveryName } = req.body;

  console.log(orderId);
  try {
    const order = await OrdersModel.findById(orderId).maxTimeMS(20000);
    const token = jwt.sign({ order }, config.secretKey);
    res.json({ token, order });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

route.get("/getOrders/:id", async (req, res) => {
  const deliveryName = req.params.id;
  try {
    const delivery = await UsersModel.findOne({ name: deliveryName }).maxTimeMS(
      20000
    );
    if (!delivery) {
      return res.status(404).send("delivery not found");
    }
    const ordersIds = delivery.orders.flatMap((product) => product);
    const ordersData = await OrdersModel.find({ _id: { $in: ordersIds } });
    const token = jwt.sign({ ordersData }, config.secretKey);

    res.json({ token, ordersData });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

route.get("/getOrdersInStore/:id", async (req, res) => {
  const deliveryName = req.params.id;
  try {
    const delivery = await UsersModel.findOne({ name: deliveryName }).maxTimeMS(
      20000
    );
    if (!delivery) {
      return res.status(404).send("delivery not found");
    }
    const ordersIds = delivery.productsStore.flatMap((product) => product);
    const ordersInStore = await OrdersModel.find({ _id: { $in: ordersIds } });
    const token = jwt.sign({ ordersInStore }, config.secretKey);

    res.json({ token, ordersInStore });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

route.post("/addOrderWithDelivery", async (req, res) => {
  const { deliveryName, idOrder } = req.body;

  const delivery = await UsersModel.findOne({ name: deliveryName });
  const order = await OrdersModel.findById(idOrder).maxTimeMS(20000);

  if (!delivery) {
    return res.send("no");
  }
  const isIdOrderExists = delivery.orders.includes(idOrder);
  if (isIdOrderExists) {
    return res.send("idOrder already exists");
  }
  delivery.orders.push(idOrder);
  delivery.productsStore.push(idOrder);
  order.situationSteps.push({
    situation: "مع الشحن",
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
  });

  const save = await delivery.save();
  const save2 = await order.save();
  if (save && save2) {
    return res.send("yes");
  }
  console.error(error);
  return res.status(500).send("حدث خطأ أثناء حفظ المستخدم");
});

module.exports = route;
