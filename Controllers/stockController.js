const axios = require("axios");
const Stock = require("../models/stock");
const convert = require("xml-js");
const { json } = require("express");
const { exec } = require("child_process");
const fs = require('fs');
require("dotenv").config();
const API_KEY = process.env.API;

const stockController = {
  //fetch all the companies from the api based on the keyword typed
  async fetchStockList(req, res) {
    const stockName = req.query.name;
    try {
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${stockName}&apikey=${API_KEY}`
      );
      console.log(response);
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
  //get individual stock from the Database
  async displayStock(req, res) {
    const symbol = req.params.symbol;
    try {
      const stock = await Stock.findOne({ symbol });
      if (!stock) {
        res.status(404).send("Stock not found in database");
      } else {
        res.render("stock_result", { stock });
        createJSONFile(stock)
        //fires the python script
        triggerPythonFunction();
      }
    } catch (error) {
      res.status(500).send("Error fetching stock details");
    }
  },
//gets the stock detail from the API and saves into the database
  async saveStockDetails(req, res) {
    const symbol = req.params.symbol.split(" ").join(""); //remove any spaces
    try {
      const quoteResponse = await axios.get(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
      );
      const quoteData = quoteResponse.data;
      console.log(quoteData);
      // Added by me, also queries for non-numeric data
      const overviewResponse = await axios.get(
        `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`
      );
      const overviewData = overviewResponse.data;
      console.log(overviewData);
      // Check if api was requested to often
      if(!(quoteData["Note"]||overviewData["Note"])) {
        // If overviewData is empty fill values with "unkown"
        var sector = "--Unknown--";
        var industry = "--Unknown--";
        var description = "--Unknown--";
        if (overviewData.Sector) {
          sector = overviewData["Sector"];
        }
        if (overviewData.Industry) {
          industry = overviewData["Industry"];
        }
        if (overviewData.Description) {
          description = overviewData["Description"];
        }
        //
        if (quoteData["Global Quote"])  {
          const quote = quoteData["Global Quote"];
          var stockDetails = {
            symbol: quote["01. symbol"],
            price: quote["05. price"],
            dayHigh: quote["03. high"],
            dayLow: quote["04. low"],
            sector: sector,             
            industry: industry,         
            description: description,   
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
      } else {
        res.status(500).send("Too many requests to API. Please wait 1 min.");
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Error fetching stock details");
    }
  },
};
//download json as a file
function createJSONFile(stock) {
  const jsonString = JSON.stringify(stock, null, 2);
  fs.writeFile("sample.json", jsonString, "utf8", (err) => {
    if (err) {
      console.error("Error writing JSON file:", err);
      return;
    }
    console.log("JSON file saved");
  });

}
// Function to trigger the Python script
function triggerPythonFunction() {
  exec("python ./converter.py", (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing Python script: ${error.message}`);
    } else {
      console.log("Python script executed successfully");
      console.log(stdout);
    }
  });
}
module.exports = stockController;
