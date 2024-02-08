const { Schema, model } = require("mongoose");

const Returns = new Schema({
  person: {
    type: String,
  },
  nameClient: {
    type: String,
  },
  phone1Client: {
    type: Number,
  },
  phone2Client: {
    type: Number,
  },
  address: {
    type: String,
  },
  date: {
    type: String,
  },
  time: {
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
});
const ReturnsModel = model("returns", Returns);
module.exports = ReturnsModel;
