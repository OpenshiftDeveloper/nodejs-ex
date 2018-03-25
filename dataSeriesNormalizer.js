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
    var duration = moment.duration(normalizedLongData[1].time.diff(normalizedLongData[0].time));
    //console.log(duration.asHours()+" duration.asHours()");
    if(duration.asHours()>20){
        normalizedWeekData = getDailyTimeline(normalizedWeekData);
    };
    // console.log(normalizedLongData);
    // console.log(lastWeekData);
    // console.log(normalizedWeekData);
    connectedData = getConnectedTimelines(normalizedLongData, normalizedWeekData)
    //console.log(normalizedTrends.length);
   
    
    return connectedData;
};


normalizeGoogleTrendsTimeline = function (timelineData) {
    normalizedData = [timelineData.length];
    for (var i in timelineData) {
        tick = new Object();
         
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
        //console.log(normalizedData[i]);
       // console.log(i);
    }
    //console.log(normalizedTrends.length);
    return normalizedData;
};

getConnectedTimelines = function (longData, weekData) {
    tick = longData[longData.length-1];
    var weekDataStartPos;
    var correctionRatio=1; 
    for (var i in weekData) {
        weekTick = weekData[i];
        if (weekTick.time>=tick.time) {
            correctionRatio =tick.value[0]/ weekTick.value[0];
           console.log("weekTick.time " +  weekTick.time+" "+i+" "+correctionRatio );
           weekDataStartPos  = i;
           break;
        }
    }
    for (var i in weekData) {
        console.log(weekData[i]);
    }    
    weekDataStartPos++;    
    connectedData = longData.concat(weekData.slice(weekDataStartPos));
    for (var i in connectedData) {
        console.log(connectedData[i]);
    }
    //console.log(longData.length+" "+weekData.length+" "+connectedData.length+" "+weekData.slice(weekDataStartPos).length);
    for (i = longData.length; i < connectedData.length; i++) { 
           //console.log(parseInt(connectedData[i].value)+" "+correctionRatio+" "+(parseInt(connectedData[i].value) * correctionRatio));
        connectedData[i].value[0] = parseInt(parseInt(connectedData[i].value) * correctionRatio);
        
     
    }
    
    return connectedData;
}

getDailyTimeline = function (hourlyTimeline) {
    dailyTimeline = [hourlyTimeline.length];
    dailyTimelinePos = 0;
    for (var i in hourlyTimeline) {
        tick = hourlyTimeline[i];
        console.log("tick.time " +  tick.time+" "+tick.time.clone().startOf('day') );
        if(tick.time.isSame(tick.time.clone().startOf('day'))){
           // console.log("tick.time equals " +  tick.time+" "+tick.time.clone().startOf('day') );
           dailyTimeline[dailyTimelinePos] =tick;
           dailyTimelinePos++;
        }
        dailyTimeline = dailyTimeline.slice(0,dailyTimelinePos);
    }
    return dailyTimeline;
}



method.normalizeCoinDesk = function (data, currentPrice) {
    results = data;
    timelineData = results.bpi;
    normalizedTimeline = [];
    console.log(Object.keys(timelineData).length+" sek "+normalizedTimeline.length);
    i = 0;
    for (var time in timelineData) {
        tick = new Object();
        tick.time = moment.utc(time);
        tick.value = timelineData[time];
        normalizedTimeline[i] = tick;
        i++;
    }
    tick = new Object();
    tick.time = moment.utc().startOf('day');
    tick.value = currentPrice.bpi.USD.rate_float;
    console.log(normalizedTimeline.length+" sek "+(normalizedTimeline.length+1));
    normalizedTimeline[normalizedTimeline.length] = tick;
    console.log(normalizedTimeline.length+" sek "+(normalizedTimeline.length+1));
    console.log(normalizedTimeline);
    return normalizedTimeline;
};


module.exports = DataSeriesNormalizer;
