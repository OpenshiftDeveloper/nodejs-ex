var method = ChartDataProducer.prototype;

function ChartDataProducer() {

}

method.getChartData = function (baseData, adjustedData) {
    chartData = [2];
    chartData[0] =[baseData.length];
    chartData[1] =[baseData.length];
    cursor = new Object();
    cursor.position = 0;
//console.log(baseData);
//console.log(adjustedData);
    for (var i in baseData) {
        tick = baseData[i];
       
        chartData[0][i] = tick.value;
        
        chartData[1][i] = method.getValueFromAdjustedDataByBaseDataTime(tick.time,adjustedData,cursor);        
        //console.log(baseData[i]);
    }
    //console.log(chartData);
    return chartData;
};

method.getValueFromAdjustedDataByBaseDataTime = function (baseDataTime, adjustedData, cursor) {
    //console.log(adjustedData);
    //console.log(cursor.position);
    
    tick = adjustedData[cursor.position];
    //console.log(adjustedData.length);
    resultValue = tick.value;
    if (cursor.position < adjustedData.length - 1) {
        nextTick = adjustedData[cursor.position + 1];
        //console.log(adjustedData);
        //console.log("nextTick.time "+nextTick.time+" "+nextTick.value +" "+baseDataTime+" "+cursor.position);
        while (nextTick.time <= baseDataTime) {
           // console.log(nextTick.time);
           resultValue = nextTick.value;
            cursor.position++;
            if (cursor.position >= adjustedData.length-1) {
                break;
            }
            
            
           
           //console.log("resultValue "+resultValue);
           nextTick = adjustedData[cursor.position+1];
        }
    }
    //console.log(resultValue);
    return resultValue;
};

// Functions which will be available to external callers
module.exports = ChartDataProducer;
