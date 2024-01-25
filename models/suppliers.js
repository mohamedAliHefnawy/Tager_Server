const { Schema, model } = require("mongoose");

const Suppliers = new Schema({
  name: {
    type: String,
  },
  phone: {
    type: String,
  },
  date: {
    type: String,
  },
  money: {
    type: Number,
  },
  indept: {
    type: Number,
  },
  // purchases: {
  //   type: [],
  // },
});

const SuppliersModel = model("suppliers", Suppliers);
module.exports = SuppliersModel;
