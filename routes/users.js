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

route.post("/login", async (req, res) => {
  const { name, password } = req.body;
  try {
    const user = await UsersModel.findOne({ name });
    if (!user) {
      return res.send("notFoundUser");
    }
    const comparePassword = await bcyrbt.compare(password, user.password);
    if (!comparePassword) {
      return res.send("no");
    }
    const validity = user.validity;
    return res.send({
      validity: validity,
      answer: "yes",
    });
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
    image: "",
    phone: phone,
    password: hashedPassword,
    validity: "زبون عادي",
    nameCompany: "",
    phoneCompany: "",
    imageCompany: "",
    colorCompany: "",
  });

  const save = await newUser.save();
  if (save) {
    return res.send("yes");
  }
  console.error(error);
  return res.status(500).send("error");
});

route.post("/editUser", async (req, res) => {
  try {
    const {
      imageURLMarketr,
      name,
      newName,
      password,
      passwordNew,
      phoneMarketer,
      nameCompany,
      phoneCompany,
      color,
      imageURLCompany,
    } = req.body;

    const user = await UsersModel.findOne({ name: name });
    if (user) {
      const comparePassword = await bcyrbt.compare(password, user.password);
      if (!comparePassword) {
        return res.send("noPaswordCom");
      } else {
        const hashedPassword = await bcyrbt.hash(passwordNew, saltRounds);
        user.image = imageURLMarketr;
        user.phone = phoneMarketer;
        user.password = hashedPassword;
        user.nameCompany = nameCompany;
        user.phoneCompany = phoneCompany;
        user.imageCompany = imageURLCompany;
        user.colorCompany = color;
        const save = await user.save();
        if (save) {
          return res.status(200).send("yes");
        }
      }
    }
  } catch (error) {
    return res.status(500).send("no");
  }
});

route.post("/addemployee", async (req, res) => {
  const { name, phone, imageURL, password, selectedValue } = req.body;
  const employee = await UsersModel.findOne({ name: name });
  if (employee) {
    return res.send("no");
  }
  const hashedPassword = await bcyrbt.hash(password, saltRounds);
  const newEmployee = new UsersModel({
    name: name,
    phone: phone,
    password: hashedPassword,
    image: imageURL,
    validity: selectedValue,
  });

  const save = await newEmployee.save();
  if (save) {
    return res.send("yes");
  }
  console.error(error);
  return res.status(500).send("حدث خطأ أثناء حفظ المستخدم");
});

route.post("/editemployee", async (req, res) => {
  try {
    const { id, name, phone, password, selectedValueValidity } = req.body;
    const employee = await UsersModel.findById(id);
    const hashedPassword = await bcyrbt.hash(password, saltRounds);
   
    employee.phone = phone;
    employee.password = hashedPassword;
    employee.validity = selectedValueValidity;
    await employee.save();
    return res.status(200).send("yes");
  } catch (error) {
    return res.status(500).send("no");
  }
});

route.post("/acceptMoney", async (req, res) => {
  try {
    const { nameDelivery, nameAdmin } = req.body;

    console.log(nameDelivery, nameAdmin);
    // const employee = await UsersModel.findById(id);
    // const hashedPassword = await bcyrbt.hash(password, saltRounds);
    // employee.name = name;
    // employee.phone = phone;
    // employee.password = hashedPassword;
    // employee.validity = selectedValueValidity;
    // await employee.save();
    // return res.status(200).send("yes");
  } catch (error) {
    return res.status(500).send("no");
  }
});

module.exports = route;
