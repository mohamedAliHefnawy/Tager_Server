const express = require("express");
const jwt = require("jsonwebtoken");
const config = require("../config");
const route = express.Router();
const bcyrbt = require("bcrypt");
const saltRounds = 10;
const NotificationsModel = require("../models/notifications");

route.get("/getNotifications", async (req, res) => {
  try {
    const notifications = await NotificationsModel.find().maxTimeMS(20000);
    const token = jwt.sign({ notifications }, config.secretKey);
    res.json({ token, notifications });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

route.post("/addNotification", async (req, res) => {
  const { message, date, time, notes, person } = req.body;

  const newNotification = new NotificationsModel({
    person: person,
    message: message,
    date: date,
    time: time,
    notes: notes,
  });

  const save = await newNotification.save();
  if (save) {
    return res.send("yes");
  }
  // console.error(error);
  // return res.status(500).send("حدث خطأ أثناء حفظ المستخدم");
});

module.exports = route;
