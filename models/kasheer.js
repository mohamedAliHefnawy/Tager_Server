const { Schema, model } = require("mongoose");

const Kasheer = new Schema({
  name: {
    type: String,
  },
  image: {
    type: String,
  },
  phone: {
    type: String,
  },
  phoneCompany: {
    type: String,
  },
  colorCompany: {
    type: String,
  },
  password: {
    type: String,
  },
  store: {
    type: String,
  },
  moneysafe: {
    type: String,
  },
  orders: {
    type: [],
  },
  money: {
    type: [
      {
        idOrder: { type: String },
        money: { type: Number },
        notes: { type: String },
        date: { type: String },
        time: { type: String },
        acceptMoney: { type: Boolean },
      },
    ],
  },
  validity: {
    type: String,
  },
});

const KasheerModel = model("kasheer", Kasheer);
module.exports = KasheerModel;
