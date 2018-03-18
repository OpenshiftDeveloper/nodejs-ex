var method = DataSeriesNormalizer.prototype;

const googleTrends = require('google-trends-api');
const coindesk = require('node-coindesk-api');

function DataSeriesNormalizer(age) {
    this._age = age;
}

method.normalizeGoogleTrends = function (data) {
    normalizedTrends = [];
    results = JSON.parse(data);
    timelineData = results.default.timelineData;

    for (var i in timelineData) {
        tick = new Object();
        tick.time = new Date(timelineData[i].formattedAxisTime);
        tick.value = timelineData[i].value;
        normalizedTrends[i] = tick;
    }
    return normalizedTrends;
};

method.normalizeCoinDesk = function (data) {
    normalizedTrends = [];
    results = data;
    timelineData = results.bpi;
    i = 0;
    for (var time in timelineData) {
        tick = new Object();        
        tick.time = new Date(time);
        tick.value = timelineData[time];        
        normalizedTrends[i] = tick;
        i++;
    }    
    return normalizedTrends;
};

method.getAge = function () {
    /* googleTrends.interestOverTime({keyword: 'Valentines Day'})
     .then(function (results) {
     normalizedTrends = method.normalizeGoogleTrends(results);
     for (var i in timelineData) {
     console.log(normalizedTrends[i].time);
     }
     
     });*/
    coindesk.getHistoricalClosePrices().then(function (data) {
        normalizedTrends = method.normalizeCoinDesk(data);         
        for (var i in normalizedTrends) {            
            console.log(normalizedTrends[i].time);
        }
    })

    return this._age;
};




module.exports = DataSeriesNormalizer;
