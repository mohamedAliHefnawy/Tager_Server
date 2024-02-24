const { Schema, model } = require("mongoose");

const Orders = new Schema({
  nameClient: {
    type: String,
  },
  phone1Client: {
    type: Number,
  },
  phone2Client: {
    type: Number,
  },
  store: {
    type: String,
  },
  address: {
    type: String,
  },
  products: {
    type: [
      {
        idProduct: { type: String },
        nameProduct: { type: String },
        imageProduct: { type: String },
        amount: { type: Number },
        price: { type: Number },
        gainMarketer: { type: Number },
        gainAdmin: { type: Number },
        size: { type: String },
      },
    ],
  },
  totalPriceProducts: { type: Number },
  gainAdmin: { type: Number },
  gainMarketer: { type: Number },
  DeliveryName: { type: String },
  DeliveryPhone: { type: String },
  marketer: { type: String },
  PhoneCompany: { type: String },
  NameCompany: { type: String },
  ImageURLCompany: { type: String },
  ColorCompany: { type: String },
  deliveryPrice: { type: String },
  situation: { type: String },
  situationSteps: {
    type: [
      {
        situation: { type: String },
        date: { type: String },
        time: { type: String },
      },
    ],
  },
  chatMessages: {
    type: [
      {
        message: { type: String },
        person: { type: String },
        valid: { type: String },
        date: { type: String },
        time: { type: String },
        seeMessage: { type: Boolean },
      },
    ],
  },
  time: { type: String },
  date: { type: String },
});
const OrdersModel = model("orders", Orders);
module.exports = OrdersModel;
