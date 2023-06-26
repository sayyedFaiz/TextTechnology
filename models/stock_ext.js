// models/Stock.js

const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema({
  symbol: String,
  sector: String,
  industry: String,
  name: String,
  country: String,
  description: String,
  currency: String,
  prices: Array,
  officers: Array,
});

const StockExt = mongoose.model("Stock", stockSchema);

module.exports = StockExt;
