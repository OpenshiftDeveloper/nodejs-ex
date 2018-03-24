var method = DataSeriesNormalizer.prototype;

const googleTrends = require('google-trends-api');
const coindesk = require('node-coindesk-api');
var moment = require('moment');

function DataSeriesNormalizer(age) {
    this._age = age;
}

method.normalizeGoogleTrends = function (data, lastWeekData) {

    
    longTimelineData = JSON.parse(data).default.timelineData;
    weekTimelineData = JSON.parse(lastWeekData).default.timelineData;
    normalizedLongData = normalizeGoogleTrendsTimeline(longTimelineData);
    normalizedWeekData = normalizeGoogleTrendsTimeline(weekTimelineData);
   //  console.log(normalizedLongData);
     console.log(lastWeekData);
     console.log(normalizedWeekData);
    connectedData = getConnectedTimelines(normalizedLongData, normalizedWeekData)
    //console.log(normalizedTrends.length);
    console.log(connectedData);
    return connectedData;
};


normalizeGoogleTrendsTimeline = function (timelineData) {
    normalizedData = [timelineData.length];
    for (var i in timelineData) {
        tick = new Object();
        // console.log(timelineData[i]);
        //console.log(timelineData[i].formattedTime);
        //console.log(timelineData[i].formattedAxisTime);
        
        tick.time = moment.utc(timelineData[i].formattedTime, 'll', true);
        
        //console.log("tick.time " +  tick.time.format('ll') + " " + moment(timelineData[i].formattedAxisTime, "MMM d dd at hh:mm A"));
        if (isNaN(tick.time)) {
            //console.log("tick.time " + tick.time.format('ll') + " " + moment(timelineData[i].formattedAxisTime, "MMM d dd at hh:mm A"));
            tick.time = moment.utc(timelineData[i].formattedAxisTime, 'll', true);
        }
        if (isNaN(tick.time)) {
            tick.time = moment.utc(timelineData[i].formattedTime, 'lll');
        }
        //console.log("tick.time " +  tick.time.format('ll'));
        tick.value = timelineData[i].value;
        normalizedData[i] = tick;
    }
    //console.log(normalizedTrends.length);
    return normalizedData;
};

getConnectedTimelines = function (longData, weekData) {
    tick = longData[longData.length-1];
    var weekDataStartPos;
    for (var i in weekData) {
        weekTick = weekData[i];
        if (weekTick.time>=tick.time) {
           console.log("weekTick.time " +  weekTick.time+" "+i );
           weekDataStartPos  = i;
           break;
        }
    }
    
    connectedData = longData.concat(weekData.slice(weekDataStartPos));
    console.log(longData.length+" "+weekData.length+" "+connectedData.length+" "+weekData.slice(weekDataStartPos).length);
    return connectedData;
}



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
