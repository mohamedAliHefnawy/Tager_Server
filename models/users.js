const { Schema, model } = require("mongoose");

const Users = new Schema({
  name: {
    type: String,
  },
  image: {
    type: String,
  },
  phone: {
    type: String,
  },
  password: {
    type: String,
  },
  validity: {
    type: String,
  },
  nameCompany: {
    type: String,
  },
  phoneCompany: {
    type: String,
  },
  imageCompany: {
    type: String,
  },
  colorCompany: {
    type: String,
  },
});
const UsersModel = model("users", Users);
module.exports = UsersModel;
