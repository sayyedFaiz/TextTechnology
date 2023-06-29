const axios = require("axios");
const Stock = require("../models/stock_ext");

function localTime2UTC(now) {
  let day = now.getUTCDate();
  if((""+day).length===1) {
    day = "0"+day;
  }
  let month = now.getUTCMonth()+1; // Javacript returns months as 0,...,11 --> +1
  if((""+month).length===1) {
    month = "0"+month;
  }
  let year = now.getUTCFullYear();
  let hour = now.getUTCHours();
  if((""+hour).length===1) {
    hour = "0"+hour;
  }
  let minute = now.getUTCMinutes();
  if((""+minute).length===1) {
    minute = "0"+minute;
  }
  let second = now.getUTCSeconds();
  if((""+second).length===1) {
    second = "0"+second;
  }
  return ""+year+"-"+month+"-"+day+" "+hour+":"+minute+":"+second;
}

function escapeXml(unsafe) {
  //// Convert special chars that are used by XML to HTML escaped versions
  return unsafe.replace(/[<>&'"]/g, function (c) {
      switch (c) {
          case '<': return '&lt;';
          case '>': return '&gt;';
          case '&': return '&amp;';
          case '\'': return '&apos;';
          case '"': return '&quot;';
      }
  });
}

function stock2xml(stock) {
  /// Input: a mongoos stock object
  /// Output: a string, containing XML
  let out = "";
  out += "<stock>\n";
  out += "\t<name>"+escapeXml(stock.name)+"</name>\n";
  out += "\t<symbol>"+escapeXml(stock.symbol)+"</symbol>\n";
  out += "\t<country>"+escapeXml(stock.country)+"</country>\n";
  out += "\t<description>"+escapeXml(stock.description)+"</description>\n";
  out += "\t<sector>"+escapeXml(stock.sector)+"</sector>\n";
  out += "\t<industry>"+escapeXml(stock.industry)+"</industry>\n";
  out += "\t<officers>\n"
  if(stock.officers[0]!=="--Unkown--") {  // in database its not an array if its "--Unknown--" but due to mongoos schema its gets wrapped into an array
    // additionally I had a type in the collect.py so its "Unkown" instead of "Unknown"
    for(let o of stock.officers) {
      out += "\t\t<officer\n>"
      out += "\t\t\t<name>"+escapeXml(o.name)+"</name>\n";
      out += "\t\t\t<title>"+escapeXml(o.title)+"</title>\n";
      out += "\t\t</officer\n>"
    }
  } else {
    out += "--Unknown--"
  }
  console.log("DEBUG-B");
  out += "\t</officers>\n";
  out += "\t<currency>"+escapeXml(stock.currency)+"</currency>\n";
  out += "\t<prices>\n"
  for(let p of stock.prices) {
    out += "\t\t<price>\n"
    out += "\t\t\t<date>"+escapeXml(p.dateOfPrice_UTC)+"</date>\n"
    out += "\t\t\t<price>"+escapeXml(""+p.price)+"</price>\n"
    out += "\t\t\t<dayHigh>"+escapeXml(""+p.dayHigh)+"</dayHigh>\n"
    out += "\t\t\t<dayLow>"+escapeXml(""+p.dayLow)+"</dayLow>\n"
    out += "\t\t</price>\n"
  }
  out += "\t</prices>\n";
  out += "</stock>\n";
  return out
}

const stockController = {
  async fetchStock(req, res) {
    const stockQuery = req.query.name;
    try {
        console.log("user-query:", stockQuery);
        // Check if stock with queried name/symbol exists
        let stock = await Stock.findOne({ $or:[
          {symbol:stockQuery},
          {name:stockQuery}
        ] });
        // If so, query up-to-date price from API and add new price to database
        if(stock !== null) {
           // Query new price information from API
          const quoteResponse = await axios.get(
            `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${stock.symbol}?modules=price`
          );
          let quoteData = quoteResponse.data.quoteSummary.result[0].price;
          // Get datetime of new price (and format as UTC)
          const today = new Date();
          // Create new price information
          newPrice = {
            price:quoteData.regularMarketPrice.raw,
            dayHigh:quoteData.regularMarketDayHigh.raw,
            dayLow:quoteData.regularMarketDayLow.raw,
            dateOfPrice_UTC: localTime2UTC(today),
          }
          // Update price information in database
          await Stock.findOneAndUpdate({symbol:stock.symbol}, {$push: {prices: newPrice}});
          // Re-query the updated stock from database (this is one redundant query, maybe find better way for dooing this)
          stock = await Stock.findOne({ symbol:stock.symbol });
          // Prepare data as XML 
          let stockXMLDoc = stock2xml(stock);
          // Render stock details as html
          res.render("stock", { stock, stockXMLDoc });
        } else {
        // Else print "missing"-message
          res.send("Stock with name or symbol "+stockQuery+" not found");
        }
    } catch (error) {
      res.send("An error occured: "+error);
    }
  },
};
module.exports = stockController;
