var method = DataSeriesNormalizer.prototype;

const googleTrends = require('google-trends-api');

function DataSeriesNormalizer(age) {
    this._age = age;
}

method.normalizeGoogleTrends = function (data) {
    normalizedTrends = [];
    results = JSON.parse(data);
    timelineData = results.default.timelineData;
    
    for (var i in timelineData) {
        thick = new Object();
        thick.time = new Date(timelineData[i].formattedAxisTime);
        thick.value = timelineData[i].value;
        normalizedTrends[i] = thick;
    }    
    return normalizedTrends;
};

method.getAge = function () {
    googleTrends.interestOverTime({keyword: 'Valentines Day'})
            .then(function (results) {
                normalizedTrends = method.normalizeGoogleTrends(results);
                for (var i in timelineData) {
                    console.log(normalizedTrends[i].time);
                }
                
            });

    return this._age;
};




module.exports = DataSeriesNormalizer;
