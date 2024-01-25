const express = require("express");
const jwt = require("jsonwebtoken");
const config = require("../config");
const route = express.Router();
const CategoriesModel = require("../models/categories");

route.get("/getCategories", async (req, res) => {
  try {
    const categories = await CategoriesModel.find().maxTimeMS(20000);
    const token = jwt.sign({ categories }, config.secretKey);
    res.json({ token, categories });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

route.post("/addCatgory", async (req, res) => {
  try {
    const { nameCatogry, imageURL } = req.body;

    const catgory = await CategoriesModel.findOne({ name: nameCatogry });
    if (catgory) {
      return res.status(200).send("nameUse");
    }
    const category = new CategoriesModel({
      name: nameCatogry,
      image: imageURL,
      active: true,
    });
    await category.save();
    return res.status(200).send("yes");
  } catch (error) {
    console.error(error);
    return res.status(500).send("no");
  }
});

route.post("/editCatgory", async (req, res) => {
  try {
    const { idCategoryy, nameCatogry, imageURL, active } = req.body;

    const catgory = await CategoriesModel.findOne({ _id: idCategoryy });

    catgory.name = nameCatogry;
    catgory.image = imageURL;
    catgory.active = active;

    await catgory.save();
    return res.status(200).send("yes");
  } catch (error) {
    return res.status(500).send("no");
  }
});

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
