var method = DataSeriesNormalizer.prototype;

const googleTrends = require('google-trends-api');
const coindesk = require('node-coindesk-api');
var moment = require('moment');

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
        console.log(timelineData[i].formattedTime);
        console.log(timelineData[i].formattedAxisTime);
        
        tick.time = moment.utc(timelineData[i].formattedTime, 'll', true);
        
        //console.log("tick.time " +  tick.time.format('ll') + " " + moment(timelineData[i].formattedAxisTime, "MMM d dd at hh:mm A"));
        if (isNaN(tick.time)) {
            //console.log("tick.time " + tick.time.format('ll') + " " + moment(timelineData[i].formattedAxisTime, "MMM d dd at hh:mm A"));
            tick.time = moment.utc(timelineData[i].formattedAxisTime, 'll', true);
        }
        if (isNaN(tick.time)) {
            tick.time = moment.utc(timelineData[i].formattedTime, 'lll');
        }
        console.log("tick.time " +  tick.time.format('ll'));
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
        tick.time = moment.utc(time);
        tick.value = timelineData[time];
        normalizedTrends[i] = tick;
        i++;
    }
    return normalizedTrends;
};


module.exports = DataSeriesNormalizer;
