const { Schema, model } = require("mongoose");

const MoneyTransfers = new Schema({
  nameTransfer: {
    type: String,
  },
  validityTransfer: {
    type: String,
  },
  date: {
    type: String,
  },
  time: {
    type: String,
  },
  money: {
    type: [
      {
        idOrder: { type: String },
        idMoney: { type: String },
        marketer: { type: String },
        money: { type: Number },
        moneyMarketer: { type: Number },
        moneyAdmin: { type: Number },
        acceptMoney: { type: Boolean },
      },
    ],
  },
});

const MoneyTransfersModel = model("moneyTransfers", MoneyTransfers);
module.exports = MoneyTransfersModel;
