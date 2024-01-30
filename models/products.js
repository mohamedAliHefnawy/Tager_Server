const { Schema, model } = require("mongoose");

const Products = new Schema({
  name: {
    type: String,
  },
  image: {
    type: [],
  },
  store: {
    type: String,
  },
  catogry: {
    type: String,
  },
  price1: {
    type: Number,
  },
  price2: {
    type: Number,
  },
  price3: {
    type: Number,
  },
  gainMarketer: {
    type: Number,
  },
  color: {
    type: String,
  },
  size: [
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
          },
        ],
      },
    },
  ],
  products: {
    type: [
      {
        name: {
          type: String,
        },
        image: {
          type: [],
        },
        catogry: {
          type: String,
        },
        price1: {
          type: Number,
        },
        price2: {
          type: Number,
        },
        price3: {
          type: Number,
        },
        gainMarketer: {
          type: Number,
        },
        color: {
          type: String,
        },
        size: [
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
                },
              ],
            },
          },
        ],
      },
    ],
  },
});
const ProductsModel = model("products", Products);
module.exports = ProductsModel;
