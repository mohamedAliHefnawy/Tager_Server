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
        size: { type: String },
      },
    ],
  },
  totalPriceProducts: { type: Number },
  gainAdmin: { type: Number },
  gainMarketer: { type: Number },
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
        admin: {
          type: [
            {
              message: { type: String },
              person: { type: String },
              date: { type: String },
              time: { type: String },
            },
          ],
        },
        marketer: {
          type: [
            {
              message: { type: String },
              date: { type: String },
              person: { type: String },
              time: { type: String },
            },
          ],
        },
        delivery: {
          type: [
            {
              message: { type: String },
              date: { type: String },
              person: { type: String },
              time: { type: String },
            },
          ],
        },
      },
    ],
  },
  time: { type: String },
  date: { type: String },
});
const OrdersModel = model("orders", Orders);
module.exports = OrdersModel;
