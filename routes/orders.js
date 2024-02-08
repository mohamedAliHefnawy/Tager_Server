const express = require("express");
const jwt = require("jsonwebtoken");
const config = require("../config");
const route = express.Router();
const OrdersModel = require("../models/orders");
const ProductsModel = require("../models/products");
const UsersModel = require("../models/users");
const NotificationsModel = require("../models/notifications");
const ReturnsModel = require("../models/returns");

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
      chatMessages: [
        {
          admin: [],
          marketer: [],
          delivery: [],
        },
      ],
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
      chatMessages: [
        {
          admin: [],
          marketer: [],
          delivery: [],
        },
      ],
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

route.post("/editOrderSituation2", async (req, res) => {
  try {
    const {
      delivery,
      idOrder,
      situationOrder,
      orderMoney,
      message,
      date,
      time,
      notes,
      products,
      nameClient,
      phone1Client,
      phone2Client,
      address,
    } = req.body;

    const order = await OrdersModel.findOne({ _id: idOrder });
    const nameDelivery = await UsersModel.findOne({ name: delivery });

    if (situationOrder === "تم التوصيل") {
      order.situationSteps.push({
        situation: situationOrder,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
      });
      nameDelivery.money.push({
        money: orderMoney,
        notes: "",
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        acceptMoney: false,
      });
    }
    if (situationOrder === "تم الإسترجاع") {
      order.situationSteps.push({
        situation: situationOrder,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
      });

      const productsToAdd = products.map((item) => ({
        idProduct: item.idProduct,
        nameProduct: item.nameProduct,
        imageProduct: item.imageProduct,
        amount: item.amount,
        price: item.price,
        size: item.size,
      }));
      nameDelivery.productsStore.push(...productsToAdd);

      const newNotification = new NotificationsModel({
        person: delivery,
        message: message,
        date: date,
        time: time,
        notes: notes,
      });
      const newReturns = new ReturnsModel({
        person: delivery,
        nameClient: nameClient,
        phone1Client: phone1Client,
        phone2Client: phone2Client,
        address: address,
        date: date,
        time: time,
        products: products.map((item) => ({
          idProduct: item.idProduct,
          nameProduct: item.nameProduct,
          imageProduct: item.imageProduct,
          amount: item.amount,
          price: item.price,
          size: item.size,
        })),
      });
      await newNotification.save();
      await newReturns.save();
    }
    const save1 = await order.save();
    const save2 = await nameDelivery.save();

    if (save1 && save2) {
      return res.status(200).send("yes");
    }
  } catch (error) {
    return res.status(500).send("no");
  }
});

route.post("/chatOrder", async (req, res) => {
  try {
    const { idOrder, text, val, admin, marketer, delivery } = req.body;
    const order = await OrdersModel.findOne({ _id: idOrder });
    if (val === "أدمن") {
      order.chatMessages[0].admin.push({
        person: admin,
        message: text,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
      });
    }
    if (val === "مندوب تسويق") {
      order.chatMessages[0].marketer.push({
        person: marketer,
        message: text,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
      });
    }
    if (val === "مندوب توصيل") {
      order.chatMessages[0].delivery.push({
        person: delivery,
        message: text,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
      });
    }

    await order.save();
    return res.status(200).send("yes");
  } catch (error) {
    return res.status(500).send("no");
  }
});
module.exports = route;
