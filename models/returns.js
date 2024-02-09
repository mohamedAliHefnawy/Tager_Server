const { Schema, model } = require("mongoose");

const Returns = new Schema({
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
