const express = require("express");
const jwt = require("jsonwebtoken");
const config = require("../config");
const route = express.Router();
const ProductsModel = require("../models/products");
const CategoriesModel = require("../models/categories");

route.get("/getProducts", async (req, res) => {
  try {
    const products = await ProductsModel.find().maxTimeMS(20000);
    const token = jwt.sign({ products }, config.secretKey);
    res.json({ token, products });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

route.get("/getProduct/:id", async (req, res) => {
  const productId = req.params.id;

  try {
    const product = await ProductsModel.findById(productId).maxTimeMS(20000);
    const token = jwt.sign({ product }, config.secretKey);
    res.json({ token, product });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

route.get("/getProductsCatogry/:id", async (req, res) => {
  const categoryName = req.params.id;
  try {
    const category = await CategoriesModel.findOne({ name: categoryName });
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    const productIds = category.products.map((product) => product._id);
    const products = await ProductsModel.find({ _id: { $in: productIds } });
    const token = jwt.sign({ products }, config.secretKey);
    res.json({ token, products });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

route.post("/addProduct", async (req, res) => {
  try {
    const {
      nameProduct,
      imageURLs,
      selectedCategory,
      priceProduct1,
      priceProduct2,
      priceProduct3,
      priceProduct4,
      colorProductMain,
      sizeProduct,
      rows,
    } = req.body;

    const product = await ProductsModel.findOne({ name: nameProduct });
    const catogry = await CategoriesModel.findOne({ name: selectedCategory });
    if (product) {
      return res.status(200).send("nameUse");
    }

    if (!catogry) {
      return res.status(404).send("nameUse");
    }

    if (!catogry.products) {
      catogry.products = [];
    }

    const newSizeProduct1 = sizeProduct.map((sizeValue) => ({
      size: sizeValue,
      amount: [],
    }));

    const newProduct = new ProductsModel({
      name: nameProduct,
      image: imageURLs,
      catogry: selectedCategory,
      price1: priceProduct1,
      price2: priceProduct2,
      price3: priceProduct3,
      gainMarketer: priceProduct4,
      color: colorProductMain,
      size: newSizeProduct1,
      products: rows.map((row) => ({
        name: nameProduct,
        catogry: selectedCategory,
        image: row.images,
        price1: +row.cost,
        price2: +row.marketer,
        price3: +row.regularCustomer,
        gainMarketer: +row.gainMarketer,
        color: row.color,
        size: row.dynamicInputs.map((sizeValue) => ({
          size: sizeValue,
          amount: 0,
        })),
      })),
    });

    const save1 = await newProduct.save();

    const newProductId = newProduct._id;
    const isProductExist = catogry.products.some((product) =>
      product._id.equals(newProductId)
    );

    if (!isProductExist) {
      catogry.products.push({ _id: newProductId });
    }
    const save2 = await catogry.save();

    if (save1 && save2) {
      return res.status(200).send("yes");
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("no");
  }
});

route.post("/editProduct", async (req, res) => {
  try {
    const {
      idProductt,
      nameProduct,
      imageURLs,
      selectedCategory,
      priceProduct1,
      priceProduct2,
      priceProduct3,
      priceProduct4,
      colorProductMain,
      sizeProduct,
      rows,
    } = req.body;

    const flatImageURLs = imageURLs.flatMap((outerArray) => outerArray);

    const newSizeProduct1 = sizeProduct.map((sizeProduct) => ({
      size: sizeProduct.size,
      // amount: 0,
    }));

    console.log("name:", flatImageURLs);
    const product = await ProductsModel.findOne({ _id: idProductt });
    // console.log("Product Found:", product);

    product.name = nameProduct;
    product.image = flatImageURLs;
    product.catogry = selectedCategory;
    product.price1 = priceProduct1;
    product.price2 = priceProduct2;
    product.price3 = priceProduct3;
    product.gainMarketer = priceProduct4;
    product.color = colorProductMain;
    product.size = newSizeProduct1;
    product.products = rows.map((row) => ({
      name: nameProduct,
      catogry: selectedCategory,
      image: row.images,
      price1: +row.cost,
      price2: +row.marketer,
      price3: +row.regularCustomer,
      gainMarketer: +row.gainMarketer,
      color: row.color,
      size: row.dynamicInputs.map((sizeValue) => ({
        size: sizeValue,
        amount: 0,
      })),
    }));

    const save1 = await product.save();
    if (save1) {
      console.log(1);
      return res.status(200).send("yes");
    }
  } catch (error) {
    return res.status(500).send("no");
  }
});

module.exports = route;
