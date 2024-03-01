const { Schema, model } = require("mongoose");

const WithdrawalRequests = new Schema({
  sumMoney: { type: Number },
  marketer: { type: String },
  pymentMethod: { type: String },
  phoneNumber: { type: String },
  situation: { type: String },
});

const WithdrawalRequestsModel = model("withdrawalRequests", WithdrawalRequests);
module.exports = WithdrawalRequestsModel;
