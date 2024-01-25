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
      totalPriceProducts,
      gainMarketer,
      marketer,
      deliveryPrice,
    } = req.body;

    const DataProducts = {
      idProduct: idProduct,
      nameProduct: nameProduct,
      imageProduct: imageProduct[0],
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
      amountAndPrice,
      totalPriceProducts,
      gainMarketer,
      marketer,
      deliveryPrice,
    } = req.body;

    const dataProducts = products.map((product) => ({
      idProduct: product._id,
      nameProduct: product.name,
      imageProduct: product.image[0],
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
      deliveryPrice: deliveryPrice[0],
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

// route.post("/editCatgory", async (req, res) => {
//   try {
//     const { idCategoryy, nameCatogry, imageURL, active } = req.body;

//     const catgory = await CategoriesModel.findOne({ _id: idCategoryy });

//     catgory.name = nameCatogry;
//     catgory.image = imageURL;
//     catgory.active = active;

//     await catgory.save();
//     return res.status(200).send("yes");
//   } catch (error) {
//     return res.status(500).send("no");
//   }
// });

// route.delete("/deleteemployee/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     await EmployeesModel.findByIdAndDelete(id);
//     res.json("yes");
//   } catch (error) {
//     res.status(500).json("no");
//   }
// });

module.exports = route;
