const express = require("express");
const jwt = require("jsonwebtoken");
const config = require("../config");
const route = express.Router();
const OrdersModel = require("../models/orders");
const ProductsModel = require("../models/products");

route.get("/getOrders", async (req, res) => {
  try {
    const orders = await OrdersModel.find().maxTimeMS(20000);
    const token = jwt.sign({ orders }, config.secretKey);
    res.json({ token, orders });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

route.get("/getOrder/:id", async (req, res) => {
  const orderId = req.params.id;
  try {
    const order = await OrdersModel.findById(orderId).maxTimeMS(20000);
    const token = jwt.sign({ order }, config.secretKey);
    res.json({ token, order });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

route.post("/addOrder", async (req, res) => {
  try {
    const {
      nameClient,
      phone1Client,
      phone2Client,
      store,
      address,
      idProduct,
      nameProduct,
      sizeProduct,
      imageProduct,
      amount,
      price,
      phoneCompany,
      nameCompany,
      imageURLCompany,
      color,
      totalPriceProducts,
      gainMarketer,
      marketer,
      deliveryPrice,
    } = req.body;

    function extractLinks(arr) {
      let links = [];
      if (Array.isArray(arr)) {
        arr.forEach((item) => {
          if (Array.isArray(item)) {
            links = links.concat(extractLinks(item));
          } else {
            links.push(item);
          }
        });
      }

      return links;
    }
    const allLinks = extractLinks(imageProduct);
    // console.log(allLinks[0]);

    const DataProducts = {
      idProduct: idProduct,
      nameProduct: nameProduct,
      imageProduct: allLinks[0],
      amount: amount,
      price: price,
      size: sizeProduct,
    };

    const order = new OrdersModel({
      nameClient: nameClient,
      phone1Client: phone1Client,
      phone2Client: phone2Client,
      store: store,
      address: address,
      products: [DataProducts],
      totalPriceProducts: totalPriceProducts,
      gainMarketer: gainMarketer,
      marketer: marketer,
      deliveryPrice: deliveryPrice[0],
      situation: "بإنتظار الموافقة",
      PhoneCompany: phoneCompany,
      NameCompany: nameCompany,
      ImageURLCompany: imageURLCompany,
      ColorCompany: color,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    });

    order.situationSteps.push({
      situation: "بإنتظار الموافقة",
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    });

    await order.save();
    return res.status(200).send("yes");
  } catch (error) {
    console.error(error);
    return res.status(500).send("no");
  }
});

route.post("/addOrderProducts", async (req, res) => {
  try {
    const {
      nameClient,
      phone1Client,
      phone2Client,
      store,
      address,
      products,
      sizes,
      phoneCompany,
      nameCompany,
      imageURLCompany,
      color,
      amountAndPrice,
      totalPriceProducts,
      gainMarketer,
      marketer,
      deliveryPrice,
    } = req.body;

    function extractLinks(arr) {
      let links = [];
      if (Array.isArray(arr)) {
        arr.forEach((item) => {
          if (Array.isArray(item)) {
            links = links.concat(extractLinks(item));
          } else {
            links.push(item);
          }
        });
      }

      return links;
    }
    const allLinks = extractLinks(products.map((image) => image.image));

    const dataProducts = products.map((product) => ({
      idProduct: product._id,
      nameProduct: product.name,
      imageProduct: allLinks[0],
      amount: amountAndPrice[product._id]?.quantity || 0,
      price: amountAndPrice[product._id]?.price || 0,
      size: sizes.find((item2) => item2[0] === product._id)?.[1],
    }));

    const order = new OrdersModel({
      nameClient: nameClient,
      phone1Client: phone1Client,
      phone2Client: phone2Client,
      store: store,
      address: address,
      products: dataProducts,
      totalPriceProducts: totalPriceProducts,
      gainMarketer: gainMarketer,
      marketer: marketer,
      PhoneCompany: phoneCompany,
      NameCompany: nameCompany,
      ImageURLCompany: imageURLCompany,
      ColorCompany: color,
      deliveryPrice: deliveryPrice[0],
      situation: "بإنتظار الموافقة",
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    });
    order.situationSteps.push({
      situation: "بإنتظار الموافقة",
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    });
    await order.save();
    return res.status(200).send("yes");
  } catch (error) {
    console.error(error);
    return res.status(500).send("no");
  }
});

route.post("/editOrder", async (req, res) => {
  try {
    const {
      id,
      nameClient,
      phone1Client,
      phone2Client,
      store,
      address,
      produtss,
      amount,
      totalPriceProducts,
      gainMarketer,
    } = req.body;

    function extractLinks(arr) {
      let links = [];
      if (Array.isArray(arr)) {
        arr.forEach((item) => {
          if (Array.isArray(item)) {
            links = links.concat(extractLinks(item));
          } else {
            links.push(item);
          }
        });
      }

      return links;
    }
    const allLinks = extractLinks(produtss.map((item) => item.imageProduct));

    const order = await OrdersModel.findOne({ _id: id });
    const dataProducts = produtss.map((product) => ({
      idProduct: product.idProduct,
      nameProduct: product.nameProduct,
      imageProduct: allLinks[0],
      amount: +amount[product.idProduct] || 0,
      price: product.price || 0,
      size: product.size || "",
    }));

    order.nameClient = nameClient;
    order.phone1Client = phone1Client;
    order.phone2Client = phone2Client;
    order.address = address;
    order.products = dataProducts;
    order.totalPriceProducts = totalPriceProducts;
    order.gainMarketer = gainMarketer;

    await order.save();
    return res.status(200).send("yes");
  } catch (error) {
    return res.status(500).send("no");
  }
});

route.post("/editOrderSituation", async (req, res) => {
  try {
    const { idOrder, situationOrder } = req.body;

    const order = await OrdersModel.findOne({ _id: idOrder });

    order.situationSteps = situationOrder;

    await order.save();
    return res.status(200).send("yes");
  } catch (error) {
    return res.status(500).send("no");
  }
});

module.exports = route;