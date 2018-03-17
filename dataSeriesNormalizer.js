var method = DataSeriesNormalizer.prototype;

const googleTrends = require('google-trends-api');

function DataSeriesNormalizer(age) {
    this._age = age;
}

method.normalizeGoogleTrends = function (data) {
    var date = new Date(data);
    return date.toUTCString();
};

method.getAge = function () {
    googleTrends.interestOverTime({keyword: 'Valentines Day'})
            .then(function (results) {
                normalizedTrends = [];
                results = JSON.parse(results);
                timelineData = results.default.timelineData;
                thick = new Object();
                for (var i in timelineData) {
                    thick.time = timelineData[i].formattedAxisTime;
                    thick.value = timelineData[i].value;
                    normalizedTrends[i] = thick;
                    
                }
                for (var i in normalizedTrends) {
                    console.log(normalizedTrends[i].time);
                }
                
                isoDate = method.normalizeGoogleTrends("Jan 1, 2004");
                console.log(isoDate);
            });

    return this._age;
};




module.exports = DataSeriesNormalizer;
