const { Schema, model } = require("mongoose");

const Categories = new Schema({
  name: {
    type: String,
  },
  image: {
    type: String,
  },
  products: {
    type: [],
  },
  active: {
    type: Boolean,
  },
});
const CategoriesModel = model("categories", Categories);
module.exports = CategoriesModel;
