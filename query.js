const db = require("./database");
const mongoose = require("mongoose");

const Model = require("./models/store");

mongoose
  .connect(
    "mongodb+srv://elhefnawy:IooPQVqVpZD4nGB8@cluster0.wuy7w3u.mongodb.net/",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(async () => {
    try {
      const result = await Model.deleteMany({});
      console.log("done");
    } catch (error) {
      console.error("error :", error);
    } finally {
      mongoose.disconnect();
    }
  })
  
  .catch((error) => {
    console.error("Error connecting to the database:", error);
  });
