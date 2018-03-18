var method = ChartModelProducer.prototype;

function ChartModelProducer() {

}

var ChartDataProducer = require("./chartDataProducer.js");




method.getChartModel = function (baseData, adjustedData) {
    chartModel = new Object();
    var chartDataProducer = new ChartDataProducer();
    chartData = chartDataProducer.getChartData(baseData, adjustedData);
    chartModel.data = chartData;
    chartModel.series = ['Series A', 'Series B'];
    chartModel.labels = getTimeLabels(baseData);
    return chartModel;
};

function getTimeLabels(baseData) {
    series = []
    for (var i in baseData) {
        tick = baseData[i];
        series[i] = tick.time;
    }
    return series;
}


module.exports = ChartModelProducer;
