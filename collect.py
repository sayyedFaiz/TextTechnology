#!/usr/bin/python3

import requests
import yahoo_fin.stock_info as si
from pymongo import MongoClient
from datetime import datetime
import time
import sys
import os



def get_symbols():
    symbols  = si.tickers_dow()
    symbols += si.tickers_ibovespa()
    symbols += si.tickers_nasdaq()
    symbols += si.tickers_nifty50()
    symbols += si.tickers_niftybank()
    symbols += si.tickers_other()
    #symbols += si.tickers_sp500()
    #symbols += si.tickers_ftse100()
    #symbols += si.tickers_ftse250()
    return list(set(symbols))

def get_company_profile(symbol):
    headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36'}
    try:
        r = requests.get("https://query1.finance.yahoo.com/v10/finance/quoteSummary/"+symbol+"?modules=assetProfile", headers=headers)
        if r.status_code == 200:
            data = r.json()
            if "quoteSummary" in data:
                if "result" in data["quoteSummary"]:
                    if len(data["quoteSummary"]["result"])>0:
                        if "assetProfile" in data["quoteSummary"]["result"][0]:
                            return data["quoteSummary"]["result"][0]["assetProfile"]
    except requests.exceptions.HTTPError:
        pass
    finally:
        time.sleep(5)
    return None

def get_company_price(symbol):
    headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36'}
    try:
        r = requests.get("https://query1.finance.yahoo.com/v10/finance/quoteSummary/"+symbol+"?modules=price", headers=headers)
        if r.status_code == 200:
            data = r.json()
            if "quoteSummary" in data:
                if "result" in data["quoteSummary"]:
                    if len(data["quoteSummary"]["result"])>0:
                        if "price" in data["quoteSummary"]["result"][0]:
                            return data["quoteSummary"]["result"][0]["price"]
    except requests.exceptions.HTTPError:
        pass
    finally:
        time.sleep(5)
    return None

def get_database(uri):
    # Create a connection using MongoClient. You can import MongoClient or use pymongo.MongoClient
    client = MongoClient(uri)
    # Create the database for our example (we will use the same database throughout the tutorial
    db = client["ExampleV2"]
    return db

def add_stock(data, db):
    col = db['stocks']
    if col.find_one({"symbol":data["symbol"],}) is None:
        col.insert_one(data)
    else:
        print("    > Not stored, already known")


from pprint import pprint
if __name__ == "__main__":
    MONGODB_URI = sys.argv[1]
    
    START_INDEX = 0
    
    symbols = get_symbols()
    symbols.sort()
    symbols.remove("")
    
    mongodb = get_database(MONGODB_URI)
    
    for i,symbol in enumerate(symbols):
        symbol = symbol.strip()
        if i < START_INDEX:
            continue
        print("Processing {:^10s}".format(symbol), "  at {:<6d}".format(i), "        left over:",len(symbols)-i)
        profile = get_company_profile(symbol)
        price = get_company_price(symbol)
        if profile is None:
            print("    > Error")
            continue
        officers = [{"name":" ".join([np for np in e["name"].split(" ") if np!="" ]), "title":e["title"]} for e in profile["companyOfficers"]]
        json_profile = {
            "_id": symbol,
            "symbol": symbol,
            "name": price["longName"],
            "country": profile["country"] if "country" in profile else "--Unkown--",
            "description": profile["longBusinessSummary"] if "longBusinessSummary" in profile else "--Unkown--",
            "sector": profile["sector"] if "sector" in profile else "--Unkown--",
            "industry": profile["industry"] if "industry" in profile else "--Unkown--",
            "officers": officers if len(officers)>0 else "--Unkown--",
            "currency":price["currency"],
            "prices":[{
                "price":price["regularMarketPrice"]["raw"], 
                "dayHigh": price["regularMarketDayHigh"]["raw"],
                "dayLow":price["regularMarketDayLow"]["raw"],
                "dateOfPrice_UTC":datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
            },]
        }
        add_stock(json_profile, mongodb)


