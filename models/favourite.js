const { Schema, model } = require("mongoose");

const Favourite = new Schema({
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
const FavouriteModel = model("favourite", Favourite);
module.exports = FavouriteModel;
