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
    type: [
      {
        products: {
          type: [
            {
              Idproduct: { type: String },
              nameProduct: { type: String },
              sizeProduct: { type: String },
              amountProduct: { type: Number },
              priceProduct: { type: Number },
            },
          ],
        },
        totalPrice: { type: Number },
        deduct: { type: Number },
        dateInvoice: { type: String },
        timeInvoice: { type: String },
      },
    ],
  },
  money: {
    type: [
      {
        idInvoice: { type: String },
        deduct: { type: Number },
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
