var method = DataSeriesNormalizer.prototype;

const googleTrends = require('google-trends-api');
const coindesk = require('node-coindesk-api');


function DataSeriesNormalizer(age) {
    this._age = age;
}

method.normalizeGoogleTrends = function (data) {
    
    results = JSON.parse(data);
    timelineData = results.default.timelineData;
    normalizedTrends = [timelineData.length];
    for (var i in timelineData) {
        tick = new Object();
        // console.log(timelineData[i]);
        // console.log(timelineData[i].value);
        tick.time = new Date(timelineData[i].formattedTime);
        if ( isNaN( tick.time.getTime() ) ) {
            tick.time =new Date(timelineData[i].formattedAxisTime);
        }        
        tick.value = timelineData[i].value;
        normalizedTrends[i] = tick;
    }
    //console.log(normalizedTrends.length);
    return normalizedTrends;
};

method.normalizeCoinDesk = function (data) {        
    results = data;
    timelineData = results.bpi;    
    normalizedTrends = [Object.keys(timelineData).length];
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
