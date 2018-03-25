var method = DataSeriesNormalizer.prototype;

const googleTrends = require('google-trends-api');
const coindesk = require('node-coindesk-api');
var moment = require('moment');

function DataSeriesNormalizer(age) {
    this._age = age;
}

method.normalizeGoogleTrends = function (baseData, weekData) {
    baseTimelineData = JSON.parse(baseData).default.timelineData;
    weekTimelineData = JSON.parse(weekData).default.timelineData;
    normalizedBaseData = normalizeGoogleTrendsTimeline(baseTimelineData);
    normalizedWeekData = normalizeGoogleTrendsTimeline(weekTimelineData);
    var duration = moment.duration(normalizedBaseData[1].time.diff(normalizedBaseData[0].time));
    if (duration.asHours() > 20) {
        normalizedWeekData = getDailyTimeline(normalizedWeekData);
    }    
    connectedData = getConnectedTimelinesWithVlaueRatioCorrection(normalizedBaseData, normalizedWeekData);
    return connectedData;
};


normalizeGoogleTrendsTimeline = function (timelineData) {
    normalizedData = [timelineData.length];
    for (var i in timelineData) {
        tick = new Object();
        tick.time = moment.utc(timelineData[i].formattedTime, 'll', true);
        if (isNaN(tick.time)) {
            tick.time = moment.utc(timelineData[i].formattedAxisTime, 'll', true);
        }
        if (isNaN(tick.time)) {
            tick.time = moment.utc(timelineData[i].formattedTime, 'lll');
        }
        tick.value = timelineData[i].value;
        normalizedData[i] = tick;
    }
    return normalizedData;
};

getConnectedTimelinesWithVlaueRatioCorrection = function (longData, weekData) {
    tick = longData[longData.length - 1];
    var weekDataStartPos = weekData.length;
    var correctionRatio = 1;
    for (var i in weekData) {
        weekTick = weekData[i];
        if (weekTick.time >= tick.time) {
            correctionRatio = tick.value[0] / weekTick.value[0];
            weekDataStartPos = i;
            break;
        }
    }
    weekDataStartPos++;
    connectedData = longData.concat(weekData.slice(weekDataStartPos));
    for (i = longData.length; i < connectedData.length; i++) {
        connectedData[i].value[0] = parseInt(parseInt(connectedData[i].value) * correctionRatio);
    }
    return connectedData;
}

getDailyTimeline = function (hourlyTimeline) {
    dailyTimeline = [hourlyTimeline.length];
    dailyTimelinePos = 0;
    for (var i in hourlyTimeline) {
        tick = hourlyTimeline[i];
        if (tick.time.isSame(tick.time.clone().startOf('day'))) {
            dailyTimeline[dailyTimelinePos] = tick;
            dailyTimelinePos++;
        }
        dailyTimeline = dailyTimeline.slice(0, dailyTimelinePos);
    }
    return dailyTimeline;
}

method.normalizeCoinDesk = function (data, currentPrice) {
    results = data;
    timelineData = results.bpi;
    normalizedTimeline = [];
    i = 0;
    for (var time in timelineData) {
        tick = new Object();
        tick.time = moment.utc(time);
        tick.value = timelineData[time];
        normalizedTimeline[i] = tick;
        i++;
    }
    normalizedTimeline = addCurrentPrice(normalizedTimeline, currentPrice);
    return normalizedTimeline;
};

addCurrentPrice = function (normalizedTimeline, currentPrice) {
    tick = new Object();
    tick.time = moment.utc().startOf('day');
    tick.value = currentPrice.bpi.USD.rate_float;
    normalizedTimeline[normalizedTimeline.length] = tick;
    return normalizedTimeline;
}


module.exports = DataSeriesNormalizer;
