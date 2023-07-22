require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const StockController = require("./Controllers/stockController");

const app = express();
const PORT = process.env.PORT;

app.use(express.static("public"));
app.use(express.static("node_modules"));
app.use(express.json())
app.set("view engine", "ejs");

app.get("/", (req, res) => {res.render("index");});
app.get('/stock', StockController.fetchStockList);
app.post('/stock_result/:symbol/save',StockController.saveStockDetails)
app.get('/stock_result/:symbol', StockController.displayStock);

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;

db.on("error", () => {
  console.error.bind(console, "MongoDB connection error:");
});
db.once("open", () => {
  console.log("Connected to MongoDB");
});
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
