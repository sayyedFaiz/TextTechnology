const axios = require("axios");
const fs = require("fs");
const Stock = require("../models/stock");
const convert = require("xml-js");
const stockController = {
  async fetchStock(req, res) {
    const stockName = req.query.name;
    try {
      const response = await axios.get(
        `https://query1.finance.yahoo.com/v1/finance/search?q=${stockName}`
      );
      const data = response.data;
      if (data.quotes.length > 0) {
        const symbol = data.quotes[0].symbol;
        console.log("symbol:", symbol);
        const quoteResponse = await axios.get(
          `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=price`
        );

        const quoteData = quoteResponse.data.quoteSummary.result[0].price;
        // Save the stock details to the database if it doesn't already exist
        let stock = await Stock.findOne({ symbol });
        if (stock != null) {
          stock.symbol = quoteData.symbol;
          stock.price = quoteData.regularMarketPrice.raw;
          stock.currency = quoteData.currency;
          stock.dayHigh = quoteData.regularMarketDayHigh.raw;
          stock.dayLow = quoteData.regularMarketDayLow.raw;
        } else {
          stock = new Stock({
            symbol: quoteData.symbol,
            price: quoteData.regularMarketPrice.raw,
            currency: quoteData.currency,
            dayHigh: quoteData.regularMarketDayHigh.raw,
            dayLow: quoteData.regularMarketDayLow.raw,
          });
        }
        await stock.save();
        res.render("stock", { stock });
        const jsonString = JSON.stringify(stock, null, 2);
        fs.writeFile("output.json", jsonString, "utf8", (err) => {
          if (err) {
            console.error("Error writing JSON file:", err);
            return;
          }
          console.log("JSON file saved");
        });
      } else {
        res.render("error");
      }
    } catch (error) {
      res.send("not found");
    }
  },
};
module.exports = stockController;
