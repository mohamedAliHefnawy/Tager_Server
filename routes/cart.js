const express = require("express");
const jwt = require("jsonwebtoken");
const config = require("../config");
const route = express.Router();
const CartModel = require("../models/cart");
const ProductsModel = require("../models/products");

route.get("/getCart", async (req, res) => {
  try {
    const cart = await CartModel.find().maxTimeMS(20000);
    const token = jwt.sign({ cart }, config.secretKey);
    res.json({ token, cart });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

route.get("/getProductsInCart/:user", async (req, res) => {
  try {
    const userName = req.params.user;
    const cart = await CartModel.findOne({
      "user.username": userName,
    });
    const productIds = cart.user.map((product) => product.products);
    const separatedData = productIds[0].map((item) => {
      const [id] = item.split("-");
      return [id];
    });

    const separatedData2 = productIds[0].map((item) => {
      const [id, size] = item.split("-");
      return [id, size];
    });

    const result = separatedData.map((item) => item[0]);
    const products = await ProductsModel.find({
      products: {
        $elemMatch: {
          _id: { $in: separatedData },
        },
      },
    });
    const products2 = await ProductsModel.find({
      _id: { $in: separatedData },
    });
    const filteredProducts = products.map((item) =>
      item.products.filter((product) => result.includes(product._id.toString()))
    );

    const filteredProducts2 = filteredProducts.flatMap((item) => item);

    const combinedProducts = [...products2, ...filteredProducts2];
    const combinedProducts2 = [...separatedData2];
    const token = jwt.sign(
      { combinedProducts, combinedProducts2 },
      config.secretKey
    );
    res.json({ token, combinedProducts, combinedProducts2 });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

route.post("/addProductToCart", async (req, res) => {
  try {
    const { user, idProduct, size } = req.body;

    const dala = `${idProduct}-${size}`;

    const userCart = await CartModel.findOne({ "user.username": user });
    if (userCart) {
      const userProductIndex = userCart.user.findIndex(
        (u) => u.username === user
      );
      if (userProductIndex !== -1) {
        const userProducts = userCart.user[userProductIndex].products;

        if (userProducts.includes(dala)) {
          const updatedProducts = userProducts.filter(
            (product) => product !== dala
          );
          userCart.user[userProductIndex].products = updatedProducts;
          await userCart.save();
          res.status(200).send("exitSure");
        } else {
          userCart.user[userProductIndex].products.push(dala);
          await userCart.save();
          res.status(200).send("noExit");
        }
      } else {
        res.status(404).send("User not found");
      }
    } else {
      const newUserCart = new CartModel({
        user: [
          {
            username: user,
            products: [dala],
          },
        ],
      });
      await newUserCart.save();
      res.status(200).send("userCreated");
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("no");
  }
});

module.exports = route;
