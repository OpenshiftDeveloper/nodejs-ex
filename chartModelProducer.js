var method = ChartModelProducer.prototype;

function ChartModelProducer() {

}

var ChartDataProducer = require("./chartDataProducer.js");

method.getChartModel = function (baseData, adjustedData) {
    //console.log(adjustedData.length);
    chartModel = new Object();
    var chartDataProducer = new ChartDataProducer();
    chartData = chartDataProducer.getChartData(baseData, adjustedData);
    //console.log(chartData);
    chartModel.data = chartData;
    chartModel.series = ['Bitcoin Price', 'Bitcoin Interest'];
    chartModel.labels = getTimeLabels(baseData);
     
    return chartModel;
};

function getTimeLabels(baseData) {
    series = []
    for (var i in baseData) {        
        tick = baseData[i];
        series[i] = tick.time.toDateString();       
    }
    return series;
}


module.exports = ChartModelProducer;
