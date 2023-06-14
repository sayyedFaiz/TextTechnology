const axios = require("axios");
const Stock = require("../models/stock");

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
        const quoteResponse = await axios.get(
          `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=price`
        );
        const quoteData = quoteResponse.data.quoteSummary.result[0].price;
        const stockDetails = {
          symbol: quoteData.symbol,
          price: quoteData.regularMarketPrice.raw,
          currency: quoteData.currency,
          dayHigh: quoteData.regularMarketDayHigh.raw,
          dayLow: quoteData.regularMarketDayLow.raw,
        };
        // Save the stock details to the database if it doesn't already exist
        const existingStock = await Stock.findOne({
          symbol: stockDetails.symbol,
        });

        if (!existingStock) {
          const stock = new Stock(stockDetails);
          await stock.save();
        }
        const savedStocks = await Stock.find({});

        res.render("stock", { stockDetails, savedStocks });
      } else {
        res.render("error");
      }
    } catch (error) {
      // res.render("error");
      res.send("not found");
    }
  },
};
module.exports = stockController;
