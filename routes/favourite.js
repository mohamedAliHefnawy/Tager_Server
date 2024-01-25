const express = require("express");
const jwt = require("jsonwebtoken");
const config = require("../config");
const route = express.Router();
const FavouriteModel = require("../models/favourite");
const ProductsModel = require("../models/products");

route.get("/getFavourite", async (req, res) => {
  try {
    const favourite = await FavouriteModel.find().maxTimeMS(20000);
    const token = jwt.sign({ favourite }, config.secretKey);
    res.json({ token, favourite });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

route.get("/getProductsInFavourite/:user", async (req, res) => {
  try {
    const userName = req.params.user;
    const favourite = await FavouriteModel.findOne({
      "user.username": userName,
    });
    const productIds = favourite.user.map((product) => product.products);
    const separatedData = productIds[0].map((item) => {
      const [id] = item.split("-");
      return [id];
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
    const token = jwt.sign({ combinedProducts }, config.secretKey);
    res.json({ token, combinedProducts });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

route.post("/addProductToFavourite", async (req, res) => {
  try {
    const { user, idProduct, size } = req.body;
    const dala = `${idProduct}-${size}`;
    const userFav = await FavouriteModel.findOne({ "user.username": user });
    if (userFav) {
      const userProductIndex = userFav.user.findIndex(
        (u) => u.username === user
      );
      if (userProductIndex !== -1) {
        const userProducts = userFav.user[userProductIndex].products;

        if (userProducts.includes(dala)) {
          const updatedProducts = userProducts.filter(
            (product) => product !== dala
          );
          userFav.user[userProductIndex].products = updatedProducts;
          await userFav.save();
          res.status(200).send("exitSure");
        } else {
          userFav.user[userProductIndex].products.push(dala);
          await userFav.save();
          res.status(200).send("noExit");
        }
      } else {
        res.status(404).send("User not found");
      }
    } else {
      const newUserFav = new FavouriteModel({
        user: [
          {
            username: user,
            products: [dala],
          },
        ],
      });
      await newUserFav.save();
      res.status(200).send("userCreated");
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("no");
  }
});

module.exports = route;
