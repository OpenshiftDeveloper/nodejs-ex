var method = ChartModelProducer.prototype;

function ChartModelProducer() {

}

var moment = require('moment');
const coindesk = require('node-coindesk-api');
const googleTrends = require('google-trends-api');

var DataSeriesNormalizer = require("./dataSeriesNormalizer.js");
var ChartDataProducer = require("./chartDataProducer.js");

method.getChartModel = function (startTimeParam, endTimeParam) {
    return new Promise(function (resolve) {
        var startTime = moment.utc(startTimeParam).toDate();
        var endTimeMoment = moment.utc(endTimeParam);
        var endTime = endTimeMoment.toDate();
        fiveDaysAgoTime = endTimeMoment.clone().subtract(5, 'days').toDate();
        coinDeskOptions = new Object();
        coinDeskOptions.start = startTime;
        coinDeskOptions.end = endTime;
        Promise.all([coindesk.getHistoricalClosePrices(coinDeskOptions),
            googleTrends.interestOverTime({
                keyword: 'bitcoin', startTime: startTime, endTime: endTime, granularTimeResolution: true, granularTimeResolution: true, timezone: "0"})
                    , googleTrends.interestOverTime({
                        keyword: 'bitcoin', startTime: fiveDaysAgoTime, endTime: endTime, granularTimeResolution: true, granularTimeResolution: true, timezone: "0"}),
            coindesk.getCurrentPrice()
        ]).then(function (values) {
            normalizedDataSeries = normalizeDataSeries(values);
            chartModel = getChartModelFromNormalizedTimelines(normalizedDataSeries.GoogleTrends, normalizedDataSeries.CoinDesk);
            resolve(chartModel);
        })
    })
}

normalizeDataSeries = function (values) {
    var dataSeriesNormalizer = new DataSeriesNormalizer();
    var normalizedDataSeries = new Object();
    normalizedDataSeries.CoinDesk = dataSeriesNormalizer.normalizeCoinDesk(values[0], values[3]);
    normalizedDataSeries.GoogleTrends = dataSeriesNormalizer.normalizeGoogleTrends(values[1], values[2]);
    return normalizedDataSeries;
}


getChartModelFromNormalizedTimelines = function (baseData, adjustedData) {
    chartModel = new Object();
    var chartDataProducer = new ChartDataProducer();
    chartData = chartDataProducer.getChartData(baseData, adjustedData);
    chartModel.data = chartData;
    chartModel.series = ['Bitcoin Price', 'Bitcoin Interest'];
    chartModel.labels = getTimeLabels(baseData);
    return chartModel;
};

function getTimeLabels(baseData) {
    series = []
    for (var i in baseData) {
        tick = baseData[i];
        series[i] = tick.time.format('lll');
    }
    return series;
}


module.exports = ChartModelProducer;
