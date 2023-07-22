const axios = require("axios");
const Stock = require("../models/stock");
const convert = require("xml-js");
require("dotenv").config();
const API_KEY = process.env.API;
const stockController = {
  async fetchStockList(req, res) {
    const stockName = req.query.name;
    try {
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${stockName}&apikey=${API_KEY}`
      );
      const data = response.data;
      if (data.bestMatches.length > 0) {
        const Companies = data.bestMatches;
        res.render("stock", { Companies });
      } else {
        res.status(404).json({ message: "Stock not found" });
      }
    } catch (error) {
      console.log(error);
      res.send("not found");
    }
  },
  async displayStock(req, res) {
    const symbol = req.params.symbol;
    try {
      const stock = await Stock.findOne({ symbol });
      if (!stock) {
        res.status(404).send("Stock not found in database");
      } else {
        res.render("stock_result", { stock });
      }
    } catch (error) {
      res.status(500).send("Error fetching stock details");
    }
  },

  async saveStockDetails(req, res) {
    const symbol = req.params.symbol.split(" ").join(""); //remove any spaces
    try {
      const quoteResponse = await axios.get(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
      );
      const quoteData = quoteResponse.data;
      console.log(quoteData)
      if (quoteData["Global Quote"]) {
        const quote = quoteData["Global Quote"];
        var stockDetails = {
          symbol: quote["01. symbol"],
          price: quote["05. price"],
          dayHigh: quote["03. high"],
          dayLow: quote["04. low"],
        };
        // Save the updated or new stock details to the database
        let stock = await Stock.findOne({ symbol });
        console.log(stock);
        if (stock) {
          // Update the existing stock details
          stock.set(stockDetails);
        } else {
          // Create a new stock entry
          stock = new Stock(stockDetails);
        }

        await stock.save();
        res.redirect(`/stock_result/${symbol}`);
      } else {
        // Handle the case when the API response does not contain stock details
        res.status(404).send("Stock not found");
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Error fetching stock details");
    }
  },
};
module.exports = stockController;
