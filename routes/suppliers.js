const express = require("express");
const route = express.Router();
const jwt = require("jsonwebtoken");
const config = require("../config");
const SuppliersModel = require("../models/suppliers");

route.get("/getSuppliers", async (req, res) => {
  try {
    const suppliers = await SuppliersModel.find().maxTimeMS(20000);
    const token = jwt.sign({ suppliers }, config.secretKey);
    res.json({ token, suppliers });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

route.get("/getSuppliersPurchases/:id", async (req, res) => {
  try {
    const SupplierId = req.params.id;
    const Supplier = await SuppliersModel.findById(SupplierId);
    if (!Supplier) {
      return res.status(404).json({ error: "Company not found" });
    }
    const PurchasesIds = Supplier?.purchases;
    const PurchasesData = await PurchasesModel.find({
      _id: { $in: PurchasesIds?.map((purchases) => purchases.id) },
    });
    res.json(PurchasesData);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

route.post("/addSuppliers", async (req, res) => {
  const { name, phone, imageURL } = req.body;

  const suppliers = await SuppliersModel.findOne({
    name: name,
  });
  if (suppliers) {
    return res.send("no");
  }
  const newSuppliers = new SuppliersModel({
    name: name,
    image: imageURL || "",
    phone: phone || "",
    money: 0,
    indept: 0,
    date: new Date().toLocaleDateString(),
  });

  const save = await newSuppliers.save();
  if (save) {
    return res.send("yes");
  }
  console.error(error);
  return res.status(500).send("حدث خطأ أثناء حفظ المستخدم");
});

route.post("/editSuppliers", async (req, res) => {
  try {
    const { id, phone, imageURL } = req.body;

    const supplier = await SuppliersModel.findOne({
      _id: id,
    });
    supplier.phone = phone;
    supplier.image = imageURL;

    await supplier.save();
    return res.status(200).send("yes");
  } catch (error) {
    return res.status(500).send("no");
  }
});

module.exports = route;
