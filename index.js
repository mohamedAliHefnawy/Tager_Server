const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = 5000 || process.env.PORT;

const auth = require("./routes/auth");
const users = require("./routes/users");
const admins = require("./routes/admins");
const categories = require("./routes/categories");
const products = require("./routes/products");
const stores = require("./routes/store");
const suppliers = require("./routes/suppliers");
const purchases = require("./routes/purchases");
const payment = require("./routes/payment");
const orders = require("./routes/orders");
const cart = require("./routes/cart");
const favourite = require("./routes/favourite");
const scanner = require("./routes/scanner");
const notifications = require("./routes/notifications");
const returns = require("./routes/returns");

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

app.use("/auth", auth);
app.use("/users", users);
app.use("/admins", admins);
app.use("/categories", categories);
app.use("/products", products);
app.use("/stores", stores);
app.use("/suppliers", suppliers);
app.use("/purchases", purchases);
app.use("/payment", payment);
app.use("/orders", orders);
app.use("/cart", cart);
app.use("/favourite", favourite);
app.use("/scanner", scanner);
app.use("/notifications", notifications);
app.use("/returns", returns);

app.get("/", function (req, res) {
  res.send("Server is online");
});

app.listen(port, () => {
  console.log("connected successfully on port", port);
});
