const { Schema, model } = require("mongoose");

const Cart = new Schema({
  user: [
    {
      username: {
        type: String,
      },
      products: [
        {
          type: String,
        },
      ],
    },
  ],
});
const CartModel = model("cart", Cart);
module.exports = CartModel;
