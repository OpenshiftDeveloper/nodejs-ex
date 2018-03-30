var method = ChartDataProducer.prototype;

function ChartDataProducer() {

}

method.getChartData = function (baseData, adjustedData) {
    chartData = [2];
    chartData[0] =[baseData.length];
    chartData[1] =[baseData.length];
    cursor = new Object();
    cursor.position = 0;
    for (var i in baseData) {
        tick = baseData[i];       
        chartData[1][i] = tick.value;        
        chartData[0][i] = method.getValueFromAdjustedDataByBaseDataTime(tick.time, adjustedData,cursor);                
    }
    return chartData;
};

method.getValueFromAdjustedDataByBaseDataTime = function (baseDataTime, adjustedData, cursor) {    
    tick = adjustedData[cursor.position];
  
    resultValue = tick.value;
    if (cursor.position < adjustedData.length - 1) {
        nextTick = adjustedData[cursor.position + 1];
        while (nextTick.time <= baseDataTime) {
           
           resultValue = nextTick.value;
            cursor.position++;
            if (cursor.position >= adjustedData.length-1) {
                break;
            }
            
           nextTick = adjustedData[cursor.position+1];
        }
    }    
    return resultValue;
};

// Functions which will be available to external callers
module.exports = ChartDataProducer;
