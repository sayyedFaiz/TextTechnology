const axios = require("axios");
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
        // console.log(stock);
        //Convert the response to JSON string and then to XML
        var options = { compact: true, ignoreComment: true, spaces: 4 };
        const xml = convert.json2xml(
          JSON.parse(JSON.stringify(stock)),
          options
        );
        res.render("stock", { stock });
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
