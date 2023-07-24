# Finance Guru

## Introduction

## Usage
The webserver is build with javascript and node. As prerequisites you need to 
1. install [node](https://nodejs.org) as well as its package manager [npm](https://nodejs.org/)
2. install [python3](https://www.python.org/)
3. have a running [MongoDB](https://www.mongodb.com/), either as a local server or by using an online cluster

If all prerequisites are satisfied, clone the repository and install all needed packages by running `npm install` in the main folder.

Now you need to setup the port on which you want your webserver to be available as well as the URI to your MongoDB database.
Therefor create a file called ".env" in the main folder (see also in the next section) and adding the following two lines
``` 
MONGODB_URI = "<URI-TO-SERVER>"
PORT = <YOUR-PORT-NO>
```
Now you should be able to start the server by the `node server` in the main folder.


## Files
|Path     | Description |
|---|---|
|./views/ |Contains the Embedded-JavaScript templates for rendering the html pages. |
./views/index.ejs | Template for the search page.
./views/stock.ejs | Template for the result page, showing the matching results.
./views/stock_results.ejs | Template for the page, showing the stock details.
./models/stock.js | The database schema for an entry in our database.
./Controllers/stockController.js | Contains the backend for the three pages of our webserver. Here the API requests as well as adding/updating entries in our database is done.
./.env | Contains two environment variables that must be set to start the webserver and connect to the MongoDB database.
./server.js | Entry script for the webserver. Start this file with node. Contains the code for assembling the webserver and defining the available pages.
./converter.py | Contains the code for convertig json to xml. Will be called by the server script automatically.

## Webpage description and example queries
