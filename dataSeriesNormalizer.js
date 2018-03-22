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
        //console.log(timelineData[i].formattedTime);
        //console.log(timelineData[i].formattedAxisTime);
        tick.time = new Date(timelineData[i].formattedTime);
        var moment = require('moment');
       // console.log("tick.time " + tick.time + " " + moment(timelineData[i].formattedAxisTime, "MMM d dd at hh:mm A"));
        if (isNaN(tick.time.getTime())) {
            tick.time = new Date(timelineData[i].formattedAxisTime);
        }
        if (isNaN(tick.time.getTime())) {
            tick.time = moment(timelineData[i].formattedTime, 'lll').toDate();
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
