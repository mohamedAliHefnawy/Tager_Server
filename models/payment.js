const { Schema, model } = require("mongoose");

const Payment = new Schema({
  name: {
    type: String,
  },
  image: {
    type: String,
  },
  money: {
    type: [
      {
        value: { type: String },
        notes: { type: String },
        person: { type: String },
        date: { type: String },
        time: { type: String },
      },
    ],
  },

  active: {
    type: Boolean,
  },
});

const PaymentModel = model("payment", Payment);
module.exports = PaymentModel;
