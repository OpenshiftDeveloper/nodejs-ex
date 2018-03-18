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
         //console.log(timelineData[i].formattedTime);
        // console.log(timelineData[i].value);
        tick.time = new Date(timelineData[i].formattedTime);
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


module.exports = DataSeriesNormalizer;
