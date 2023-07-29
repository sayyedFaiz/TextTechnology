const Stock = require("../models/stock");
require("dotenv").config();


const overviewController = {
    // Aggreagtes data from MongoDB and displays an overview page
    async displayDatabaseOverview(req, res) {
        // Count items in database
        numStocks = await Stock.aggregate([
            {$count: "count"},
        ]);
        numStocks = numStocks[0]["count"];
        // Count number of items per unique value of "sector"
        sectorCounts = await Stock.aggregate([
            {$group: {
                _id: "$sector",
                count: {$count: {}}
            }},
        ]);
        numSectors = sectorCounts.length;
        sectorDist = {labels: [], datasets: {"label":"Sector", "data":[]}};
        for(let e of sectorCounts) {
            sectorDist.labels.push(e["_id"]);
            sectorDist.datasets.data.push(e["count"]);
        }
        sectorDist.datasets = [sectorDist.datasets,];
        // Count number of items per unique value of "industry"
        industryCounts = await Stock.aggregate([
            {$group: {
                _id: "$industry",
                count: {$count: {}}
            }},
        ]);
        numIndustries = industryCounts.length;
        industryDist = {labels: [], datasets: {"label":"Industry", "data":[]}};
        for(let e of industryCounts) {
            industryDist.labels.push(e["_id"]);
            industryDist.datasets.data.push(e["count"]);
        }
        industryDist.datasets = [industryDist.datasets,];
        // Preate object to be passed to ejs-template
        aggregation = {
            numItems: numStocks,
            numSectors: numSectors,
            numIndustries: numIndustries,
            avgPerSector: numStocks/numSectors,
            avgPerIndustrie: numStocks/numIndustries,
            distSector: JSON.stringify(sectorDist),
            distIndustry: JSON.stringify(industryDist),
        };
        console.log(aggregation);
        res.render("overview", { aggregation });
    }
}


module.exports = overviewController;