const express = require("express");
const jwt = require("jsonwebtoken");
const config = require("../config");
const route = express.Router();
const bcyrbt = require("bcrypt");
const saltRounds = 10;
const UsersModel = require("../models/users");

route.get("/getUsers", async (req, res) => {
  try {
    const users = await UsersModel.find().maxTimeMS(20000);
    const token = jwt.sign({ users }, config.secretKey);
    res.json({ token, users });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

route.get("/getUser/:id", async (req, res) => {
  const userName = req.params.id;
  try {
    const user = await UsersModel.findOne({ name: userName }).maxTimeMS(20000);
    const token = jwt.sign({ user }, config.secretKey);
    res.json({ token, user });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});


route.post("/addOrderWithDelivery", async (req, res) => {
  const { deliveryName, idOrder } = req.body;

  console.log(deliveryName, idOrder);


  // const  delivery = await UsersModel.findOne({ name: name });
  // if (!delivery) {
  //   return res.send("no");
  // }

  // const newEmployee = new UsersModel({
  //   name: name,
  //   phone: phone,
  //   password: password,
  //   image: imageURL,
  //   validity: selectedValue,
  // });

  // const save = await newEmployee.save();
  // if (save) {
  //   return res.send("yes");
  // }
  console.error(error);
  return res.status(500).send("حدث خطأ أثناء حفظ المستخدم");
});

route.post("/editemployee", async (req, res) => {
  try {
    const { id, name, phone, password, selectedValueValidity } = req.body;
    const employee = await UsersModel.findById(id);

    employee.name = name;
    employee.phone = phone;
    employee.password = password;
    employee.validity = selectedValueValidity;

    await employee.save();
    return res.status(200).send("yes");
  } catch (error) {
    return res.status(500).send("no");
  }
});

module.exports = route;
