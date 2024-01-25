const { Schema, model } = require("mongoose");

const Purchases = new Schema({
  Products: {
    type: [
      {
        name: { type: String },
        image: { type: String },
        details: [
          {
            size: {
              type: String,
            },
            store: {
              type: [
                {
                  nameStore: {
                    type: String,
                  },
                  amount: {
                    type: Number,
                  },
                  price: {
                    type: Number,
                  },
                },
              ],
            },
          },
        ],
      },
    ],
  },
  stepsPayment: {
    type: [
      {
        price: { type: String },
        employee: { type: String },
        time: { type: String },
        date: { type: String },
      },
    ],
  },
  payment: { type: Number },
  totalProducts: { type: Number },
  totalPrice: { type: Number },
  indebt: { type: Number },
  supplier: { type: String },
  moneySafe: { type: String },
  date: { type: String },
  time: { type: String },
});
const PurchasesModel = model("purchases", Purchases);
module.exports = PurchasesModel;
