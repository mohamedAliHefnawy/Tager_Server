const express = require("express");
const jwt = require("jsonwebtoken");
const config = require("../config");
const route = express.Router();
const bcyrbt = require("bcrypt");
const saltRounds = 10;
const AdminsModel = require("../models/admins");

route.get("/getAdmins", async (req, res) => {
  try {
    const admins = await AdminsModel.find().maxTimeMS(20000);
    const token = jwt.sign({ admins }, config.secretKey);
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

route.post("/login", async (req, res) => {
  const { name, password } = req.body;

  try {
    const admin = await AdminsModel.findOne({ name });

    if (!admin) {
      return res.send("notFoundAdmin");
    }
    const comparePassword = await bcyrbt.compare(password, admin.password);
    if (admin.password !== password ) {
      return res.send("noPassword");
    }
    if (admin.validity !== "adminTwo") {
      return res.send("noValidity");
    }

    return res.send("yes");
  } catch (error) {
    console.error(error);
    return res.status(500).send("error");
  }
});

route.post("/signUp", async (req, res) => {
  const { name, phone, password } = req.body;
  const user = await UsersModel.findOne({ name });
  if (user) {
    return res.send("no");
  }

  const hashedPassword = await bcyrbt.hash(password, saltRounds);
  const newUser = new UsersModel({
    name: name,
    phone: phone,
    password: hashedPassword,
    validity: "marketer",
  });


  const save = await newUser.save();
  if (save) {
    return res.send("yes");
  }
  console.error(error);
  return res.status(500).send("error");
});


module.exports = route;
