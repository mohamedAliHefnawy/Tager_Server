const { Schema, model } = require("mongoose");

const Stores = new Schema({
  name: {
    type: String,
  },
  gbs: {
    type: String,
  },
  priceDelivery: {
    type: Number,
  },
  products: {
    type: [{}],
    default: [],
  },
});
const StoresModel = model("stores", Stores);
module.exports = StoresModel;
