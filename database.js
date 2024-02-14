const mongoose = require("mongoose");


// elhefnawy:IooPQVqVpZD4nGB8@cluster0.wuy7w3u.mongodb.net/
mongoose
  .connect(
    "mongodb+srv://elhefnawy:IooPQVqVpZD4nGB8@cluster0.wuy7w3u.mongodb.net/"
  )
  .then(() => {
    console.log("conected database");
  })
  .catch(() => {
    console.log("error");
  });
  
  


