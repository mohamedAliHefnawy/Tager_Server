const express = require("express");
const jwt = require("jsonwebtoken");
const config = require("../config");
const route = express.Router();
const saltRounds = 10;
const UsersModel = require("../models/users");
const ProductsModel = require("../models/products");
const OrdersModel = require("../models/orders");

route.get("/getBestMarketer", async (req, res) => {
  try {
    const bestMarketer = await UsersModel.aggregate([
      {
        $match: {
          orders: { $exists: true, $ne: [] },
          validity: "مندوب تسويق",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          image: 1,
          phone: 1,
          password: 1,
          orders: 1,
          ordersCount: { $size: "$orders" },
        },
      },
      {
        $sort: { ordersCount: -1 },
      },
      {
        $limit: 5,
      },
    ]);

    const token = jwt.sign({ bestMarketer }, config.secretKey);
    res.json({ token, bestMarketer });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

route.get("/getBestDelivery", async (req, res) => {
  try {
    const bestDelivery = await UsersModel.aggregate([
      {
        $match: {
          orders: { $exists: true, $ne: [] },
          validity: "مندوب توصيل",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          image: 1,
          phone: 1,
          password: 1,
          orders: 1,
          ordersCount: { $size: "$orders" },
        },
      },
      {
        $sort: { ordersCount: -1 },
      },
      {
        $limit: 5,
      },
    ]);

    const token = jwt.sign({ bestDelivery }, config.secretKey);
    res.json({ token, bestDelivery });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

route.get("/getBestProductsSelling", async (req, res) => {
  try {
    const bestProductsSelling = await ProductsModel.find();
    const productsArrays = bestProductsSelling.map(
      (product) => product.products
    );

    // console.log(bestProductsSelling)
    const allProducts = [].concat(...productsArrays);
    let arayAllProducts = [];

    let Id = "";

    for (product of bestProductsSelling) {
      Id = product._id;
      arayAllProducts.push({
        idProduct: product._id,
        name: product.name,
        image: product.image[0],
        catogry: product.catogry,
        price1: product.price1,
        price2: product.price2,
        price3: product.price3,
        numbersSells: product.numbersSells,
      });
    }

    for (product of allProducts) {
      arayAllProducts.push({
        idProduct: '',
        name: product.name,
        image: product.image[0],
        catogry: product.catogry,
        price1: product.price1,
        price2: product.price2,
        price3: product.price3,
        numbersSells: product.numbersSells,
      });
    }

    const sortedProducts = arayAllProducts.sort(
      (a, b) => b.numbersSells - a.numbersSells
    );
    const top5Products = sortedProducts.slice(0, 5);
    const token = jwt.sign({ top5Products }, config.secretKey);
    res.json({ token, top5Products });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

route.get("/getNumberOrdersInYear", async (req, res) => {
  try {
    const orders = await OrdersModel.find();
    // console.log(orders.map((item) => item.situationSteps[0].date));
    const orderDates = orders.map(
      (item) => new Date(item.situationSteps[0].date)
    );
    const ordersPerMonth = new Map();
    orderDates.forEach((date) => {
      const monthYearKey = `${date.getMonth() + 1}/${date.getFullYear()}`;

      if (ordersPerMonth.has(monthYearKey)) {
        ordersPerMonth.set(monthYearKey, ordersPerMonth.get(monthYearKey) + 1);
      } else {
        ordersPerMonth.set(monthYearKey, 1);
      }
    });

    const ordersPerMonthObj = Object.fromEntries(ordersPerMonth);
    const token = jwt.sign(
      { ordersPerMonth: ordersPerMonthObj },
      config.secretKey
    );
    res.json({ token, ordersPerMonth: ordersPerMonthObj });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = route;
