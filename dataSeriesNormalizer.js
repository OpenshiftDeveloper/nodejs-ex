var method = DataSeriesNormalizer.prototype;

const googleTrends = require('google-trends-api');
const coindesk = require('node-coindesk-api');
var moment = require('moment');

function DataSeriesNormalizer(age) {
    this._age = age;
}

method.normalizeGoogleTrends = function (baseData, last5DaysHighResolution) {
    baseTimelineData = JSON.parse(baseData).default.timelineData;
    last5DaysHighResolutionData = JSON.parse(last5DaysHighResolution).default.timelineData;
    normalizedBaseData = method.normalizeGoogleTrendsTimeline(baseTimelineData);
    normalizedLast5DaysHighResolution = method.normalizeGoogleTrendsTimeline(last5DaysHighResolutionData);
    normalizedLast5Days = decideIfToConnectHighResDataOrDailyData(normalizedBaseData, normalizedLast5DaysHighResolution);
    connectedData = getConnectedDataSeriesWithValueRatioCorrection(normalizedBaseData, normalizedLast5Days);
    return connectedData;
};

decideIfToConnectHighResDataOrDailyData = function (normalizedBaseData, normalizedLast5DaysHighResolution) {
    if (isGoogleTrendsDataInHighResolution(normalizedBaseData)) {
        return normalizedLast5DaysHighResolution;
    }
    return getDailyTimeline(normalizedLast5DaysHighResolution);
}


isGoogleTrendsDataInHighResolution = function (googleTrendsData) {
    var duration = moment.duration(googleTrendsData[1].time.diff(googleTrendsData[0].time));
    if (duration.asHours() > 20) {
        return false;
    }
    return true;
}


method.normalizeGoogleTrendsTimeline = function (timelineData) {
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

getConnectedDataSeriesWithValueRatioCorrection = function (baseData, last5DaysHighResolution) {
    result = getCorrectionRatioAndStartOfPartToBeConnectedFromHighResData(baseData, last5DaysHighResolution);
    connectedData = connectLastDays(baseData, last5DaysHighResolution, result.last5DaysHighResolutionStartPos);
    //return fixLastDaysValuesAccordingToTheRatio(connectedData, baseData);
    return  baseData;
}

connectLastDays = function (baseData, last5DaysHighResolution, last5DaysHighResolutionStartPos) {
    return baseData.concat(last5DaysHighResolution.slice(last5DaysHighResolutionStartPos));
}

fixLastDaysValuesAccordingToTheRatio = function (connectedData, baseData) {
    for (i = baseData.length; i < connectedData.length; i++) {
        connectedData[i].value[0] = parseInt(parseInt(connectedData[i].value) * result.correctionRatio);
    }
    return connectedData;
}

getCorrectionRatioAndStartOfPartToBeConnectedFromHighResData = function (baseData, last5DaysHighResolution) {
    var result = new Object();
    baseTick = baseData[baseData.length - 1];
    result.last5DaysHighResolutionStartPos = last5DaysHighResolution.length;
    result.correctionRatio = 1;
    for (var i in last5DaysHighResolution) {
        last5DaysTick = last5DaysHighResolution[i];
        if (last5DaysTick.time >= baseTick.time) {
            result.correctionRatio = tick.value[0] / last5DaysTick.value[0];
            result.last5DaysHighResolutionStartPos = i;
            break;
        }
    }
    result.last5DaysHighResolutionStartPos++;
    return result;
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
