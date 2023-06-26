require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const StockController = require("./Controllers/stockController");
const StockControllerExt = require("./Controllers/stockController_ext");
const app = express();
const PORT = process.env.PORT;
app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/search", (req, res) => {
  res.render("index_search");
});
app.get('/results', StockControllerExt.fetchResults);

app.get("/", (req, res) => {
  res.render("index");
});
app.get('/stock', StockController.fetchStock);
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
