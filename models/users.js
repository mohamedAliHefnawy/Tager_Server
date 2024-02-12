const { Schema, model } = require("mongoose");

const Users = new Schema({
  name: {
    type: String,
  },
  image: {
    type: String,
  },
  phone: {
    type: String,
  },
  password: {
    type: String,
  },
  orders: {
    type: [],
  },
  productsStore: {
    type: [],
    productsReturn: [
      {
        idProduct: { type: String },
        nameProduct: { type: String },
        imageProduct: { type: String },
        amount: { type: Number },
        price: { type: Number },
        size: { type: String },
        store: { type: String },

      },
    ],
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
  nameCompany: {
    type: String,
  },
  phoneCompany: {
    type: String,
  },
  imageCompany: {
    type: String,
  },
  colorCompany: {
    type: String,
  },
});
const UsersModel = model("users", Users);
module.exports = UsersModel;
