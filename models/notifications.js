const { Schema, model } = require("mongoose");

const Notifications = new Schema({
  person : { type: String },
  marketer : { type: String },
  message: { type: String },
  notes: { type: String },
  orders: { type: [] },
  date: { type: String },
  time: { type: String },
  showed: { type: Boolean },
});
const NotificationsModel = model("notifications", Notifications);
module.exports = NotificationsModel;
