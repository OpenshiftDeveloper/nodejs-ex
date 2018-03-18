var method = ChartDataProducer.prototype;

function ChartDataProducer() {

}

method.getChartData = function (baseData, adjustedData) {
    chartData = [2];
    chartData[0] =[baseData.length];
    chartData[1] =[baseData.length];
    cursor = new Object();
    cursor.position = 0;
//0console.log(baseData);
//console.log(adjustedData);
    for (var i in baseData) {
        tick = baseData[i];
       
        chartData[0][i] = tick.value;
        
        chartData[1][i] = method.getValueFromAdjustedDataByBaseDataTime(tick.time,adjustedData,cursor);        
    }
    //console.log(chartData);
    return chartData;
};

method.getValueFromAdjustedDataByBaseDataTime = function (baseDataTime, adjustedData, cursor) {
   // console.log(baseDataTime);
    //console.log(cursor.position);
    
    tick = adjustedData[cursor.position];
    resultValue = tick.value;
    if (cursor.position < adjustedData.length - 1) {
        nextTick = adjustedData[cursor.position + 1];
        
        while (nextTick.time < baseDataTime) {
           // console.log(nextTick.time);
            cursor.position++;
            if (cursor.position >= adjustedData.length) {
                break;
            }
            resultValue = nextTick.value;
            nextTick = adjustedData[cursor.position];
        }
    }
   // console.log(resultValue);
    return resultValue;
};

// Functions which will be available to external callers
module.exports = ChartDataProducer;
