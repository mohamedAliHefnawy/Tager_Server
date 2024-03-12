const { Schema, model } = require("mongoose");

const Stores = new Schema({
  name: {
    type: String,
  },
  details: [
    {
      gbs: { type: String },
      price: { type: Number },
    },
  ],
  products: {
    type: [{}],
    default: [],
  },
});
const StoresModel = model("stores", Stores);
module.exports = StoresModel;
