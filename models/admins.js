const { Schema, model } = require("mongoose");

const Admins = new Schema({
  name: {
    type: String,
  },
  phone: {
    type: String,
  },
  password: {
    type: String,
  },
  validity: {
    type: String,
  },
});
const AdminsModel = model("admins", Admins);
module.exports = AdminsModel;
