const axios = require("axios");
const fs = require("fs");
const StockExt = require("../models/stock_ext");


function buildQuery(queryText, searchType) {
  // Build a query from a peach of text
  let queryRegEx = queryText;
  console.log(searchType);
  if(searchType==="keywords") {
    while(queryRegEx.includes(" ")) {
      queryRegEx = queryRegEx.replace(" ", "|");
    }
    console.log("keywords search:", queryRegEx);
  }
  return queryRegEx;
}


async function queryFromMongo(fieldname, queryText, searchType) {
  // Build query for database
  let queryRegEx = buildQuery(queryText, searchType);
  let query = {};
  query[fieldname] = {$regex: queryRegEx, $options: 'i'};  // -i make the search case-insensitive!!
  // Query stocks
  let stocks = []
  try {
    stocks = await StockExt.find(query); 
  } catch (error) {
    console.log("Error in queryFromMongo");
  }
  return stocks;
}

const stockController = {
  async fetchResults(req, res) {
    // Parse URL params
    const queryText = req.query.query;
    const searchType = req.query.searchType;
    // Search stocks for each field
    let stocks = [];
    if(req.query.bySymbol !== undefined){
      let result = await queryFromMongo("symbol", queryText, searchType);
      for(let e of result) {
        stocks.push(e);
      }
    }
    if(req.query.byName !== undefined){
      let result = await queryFromMongo("name", queryText, searchType);
      for(let e of result) {
        stocks.push(e);
      }
    }
    if(req.query.byCountry !== undefined){
      let result = await queryFromMongo("country", queryText, searchType);
      for(let e of result) {
        stocks.push(e);
      }
    }
    if(req.query.byDescription !== undefined){
      let result = await queryFromMongo("description", queryText, searchType);
      for(let e of result) {
        stocks.push(e);
      }
    }
    // Problem: Maybe same stock multiple times in the list 
    res.render("stock_results", {stocks});
  }
}


module.exports = stockController;
