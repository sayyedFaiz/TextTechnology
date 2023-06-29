# Intro
The goal of this project is to build a database of stock information (prices and general company information).
Trough a webpager users can inspect the contents of the database and investigate stock prices.
During access stock-prices brought up-to-date interactivly, each time a user investiagtes a stock item.

# Usage
## Install
First clone this repo.
To install all needed javascript packages run 
``` npm -i ```

Note that you also need a MongoDB with a database containing a collection with name "stocks".

## The collect script
Run the collect script as follows.
```python3 collect.py <path-to-your-database>```
It queries over 10k of stock symbols from the yahoo_fin package.
And starts querying there respective informations from the yahoo API. 
If the script stops (or you want to stop it), note the last processed index.
Then befor restarting, set the START_INDEX varibale (second line of main-block) the indext to start at.

## The server
Run the server from commandline with:
```PORT=<port-to-host-the-webpage> MONGODB_URI=<path-to-your-database> node start server```
Eg. is you run:
```PORT=4200 MONGODB_URI="mongodb://localhost:27017/ExampleV2" node server```
The webpage can be accesed via your browser by visting: 
`http://localhost:4200/`, for the stock details page
`http://localhost:4200/search`, for the search page
In this example the MongoDB is a local database instance.
    
## Search page
If the server runs, open the webpage `http://localhost:4200/search`.
Then you will see the following page:
In the textfield you can enter query words (the search is NOT case-sensitive).
You can also specifiy if you want to perform an exact-phrase or a keyword search.
The keyword search connects each word (seperated by whitespace) with a logical OR,
so a field must contain one of the specified words somewere in its contents to match the query.
The exact-phrase search searches each specified field for the appearance of the exact specified query (including the whitespaces but ignoring case).
Nevertheless a text-search is performed, so the query can appear anywhere in a fields content (beginning, mid, end) to match the query.
You can also specify which fields to consider while searching.
Press 'search' to see the matching database entries.

## Search Result page
If the server runs, open the webpage `http://localhost:4200/results?query=<your-query>&<fields-to-be-searched>`
Eg. for searching "Medical Technology" in the Description field visit: `http://localhost:4200/results?query=Medical+Technology&byDescription=on`

You will see a page like this:
Here all results matching your query are shown in a HTML table.
Please note: Sofar there is a bug, same items can appear multiple times. TBD: Fix.

## Stock Details search page
If the server runs, open the webpage `http://localhost:4200/`
Then you will see the following page:
The the textfield you can specify the Symbol/Ticker or Name of a company.
Press 'search' to see the database entry and up-to-date price.

## Stock Details result page
If the server runs, open the webpage `http://http://localhost:4200/stock?name=<SYMBOL-or-NAME>`
You will be presented with a page like this:

The price list will contain all prices queried so far. Each time this page is loaded, the underling javascript queries an up-to-date price from the yahoo-API and appends it to this list, so the list will grow each time the page is reloded.
If you want to quickly store the stock information, press the 'Download as XML' button. An autmatic download will start, providing you with an XML file containing all displaied and extra informations.
(TBD: Maybe offer a schema to validate downloaded files??)
Note that if a piece of information is not available a "--Unkown--" text is shown, except for the officiers where the whole section will be missing if they are not known.

# Files and directories
|Path     | Desecription |
|---|---|
|./views/ | Contains the html-pages and embedded-javascript templates for rendering out four pages. |
./views/index.ejs | Renders the "Stock-Details" search page. Lets user enter the query.
./views/stock.ejs | Renders the "Stock-Details" results.
./views/index_search.ejs | Renderes the "Search-Function" page. Lets the user enter queries.
./views/stock_results.ejs | Renders the results of the "Search-Funtion page".
./models/ | Contains the database models for the Stock object. Mongoose (js-package) requires such a schema definition in order to create js objects from the database responses.
./models/stock_ext.js | Contains the schema for a Stock object.
./models/stock.js | For now, depricated. Please ignore.
./Controlers/ | Contains the code that handels the database/api queries. Background for the "views/index.ejs" annd the "views/index_search.ejs" pages.
./Controlers/stockController.js | Handels the user interactions from the index.ejs page. Here the up-to-date stock prices is queried from the yahoo-financial api as well as the stock entry from our MongoDB is done here. Also the MongoDB gets updated here.
./Controlers/stockController_ext.js | Handels the user interactions from the index_search.ejs page. Here only queries to our MongoDB are done. Users can specify query words, decide on a searchType and on the fields to serch in. The MongoDB entries are queried for all specified fields and rendered ojn the stock_results.ejs page.
./collect.py | The script that fills the MongoDB with instances.
./server.js | Entry point for the server, this code compiles the webpage from its parts.
	
# Examples and Statistics
## Statistics 
Currently our MongoDB contains entires for TBD stocks.
|Field | % of examples where info is available | Average-Length |
|--|--|--|
| Symbol      | 100 | - |
| Name        | 100 | - |
| Sector      | s | - |
| Industry    | s | - |
| Description | s | - |
| Officers    | s | s |
| Prices      | s | s |

## Examples
### Search-1
### Search-2
### Details-1

