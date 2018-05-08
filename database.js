var method = Database.prototype;

const googleTrends = require('google-trends-api');
var DataSeriesNormalizer = require("./dataSeriesNormalizer.js");
var moment = require('moment');

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
        ip = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
        mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
        mongoURLLabel = "";

if (mongoURL == null) {

    mongoHost = "127.0.0.1",
            mongoPort = 27017,
            mongoDatabase = "sampledb",
            mongoPassword = "87UtqdClveeugMkf"
    mongoUser = "userFHG";

    if (mongoHost && mongoPort && mongoDatabase) {
        mongoURLLabel = mongoURL = 'mongodb://';
        if (mongoUser && mongoPassword) {
            mongoURL += mongoUser + ':' + mongoPassword + '@';
        }
        // Provide UI label that excludes user id and pw
        mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
        mongoURL += mongoHost + ':' + mongoPort + '/' + mongoDatabase;

    }
}

var db = null,
        dbDetails = new Object();

var initDb = function (callback) {
    console.log('mongoURL ', mongoURL);
    if (mongoURL == null)
        return;

    var mongodb = require('mongodb');
    if (mongodb == null)
        return;

    mongodb.connect(mongoURL, function (err, conn) {
        if (err) {
            callback(err);
            return;
        }

        db = conn;
        dbDetails.databaseName = db.databaseName;
        dbDetails.url = mongoURLLabel;
        dbDetails.type = 'MongoDB';

        console.log('Connected to MongoDB at: %s', mongoURL);
    });
};

function Database() {

}

method.getLastStoredWeekData = function () {
    return new Promise((resolve, reject) => {
        if (!db) {
            initDb(function (err) {});
            return reject(null);
        }

        if (db) {
            var mysort = {time: -1};
            db.collection("interest").find().sort(mysort).limit(24).toArray(function (err, result) {
                if (err)
                    return reject(err);
                //console.log("getLastStoredWeekData " + result + " " + result[0].time + " " + result[0].value);
                resolve(result);
            });
        }
    });
}

method.getBetweenDates = function (from, to) {
    console.log("method.getBetweenDates from to " + from + " " + to);

    return new Promise((resolve, reject) => {
        if (!db) {
            initDb(function (err) {});
            return reject(null);
        }

        if (db) {
            //console.log("method.getBetweenDates find " + from + " " + to);
            db.collection("interest").find({
                time: {
                    $gt: from,
                    $lt: to
                }
            }).toArray(function (err, result) {

                if (err)
                    return reject(err);
                //console.log("method.getBetweenDates " + result.length + " " + result[0].time);
                resolve(result);
            });
        }
    });


}



method.insertDataMissingFrom = function (lastDataDate) {
    if (!db) {
        initDb(function (err) {});
    }

    if (db) {


        Promise.all([googleTrends.interestOverTime({
                keyword: 'bitcoin', startTime: lastDataDate, endTime: moment().utc().toDate(), granularTimeResolution: true, granularTimeResolution: true, timezone: "0"})
        ]).then(function (values) {
            var dataSeriesNormalizer = new DataSeriesNormalizer();

            timelineData = JSON.parse(values[0]).default.timelineData;
            normalizedGoogleTrendsTimeline = dataSeriesNormalizer.normalizeGoogleTrendsTimeline(timelineData);
            dataToBeStored = getFormatToBeStoredInDatabase(normalizedGoogleTrendsTimeline);

            console.log(dataToBeStored);
            /*db.collection("interest").insertMany(dataToBeStored, function (err, res) {
             if (err)
             throw err;
             console.log("Number of documents inserted: " + res.insertedCount);
             db.close();
             });*/
        })
    }

}

method.getDataFromGoogleTrends = function (from, to) {
    
    return new Promise((resolve, reject) => {
        if (!db) {
            initDb(function (err) {});
            return reject(null);
        }

        if (db) {
            Promise.all([googleTrends.interestOverTime({
                    keyword: 'bitcoin', startTime: from, endTime: to, granularTimeResolution: true, granularTimeResolution: true, timezone: "0"})
            ]).then(function (values) {
                console.log("getDataFromGoogleTrends "+from+" "+to);
                console.log(values[0]);
                var dataSeriesNormalizer = new DataSeriesNormalizer();
                timelineData = JSON.parse(values[0]).default.timelineData;
                normalizedData = dataSeriesNormalizer.normalizeGoogleTrendsTimeline(timelineData);
                resolve(normalizedData);
            }).catch(function (error) {
                return reject(error);
            });
        }
    });
}


function getFormatToBeStoredInDatabase(normalizedData) {
    dataToBeStoredInDatabase = [normalizedData.length];
    for (var i in normalizedData) {
        tick = new Object();
        tick.time = normalizedData[i].time.toDate();
        tick.value = normalizedData[i].value[0];
        dataToBeStoredInDatabase[i] = tick;
    }
    return dataToBeStoredInDatabase;
}

function getTwoFirstEndOfDayTicks(data) {
   console.log("getTwoFirstEndOfDayTicks");
    /* console.log(data);*/
    twoFirstEndOfDayTicks = new Array(2);
    firstFound = false;
    for (i in data) {
        tick = data[i]
        if (moment(tick.time).diff(moment(tick.time).startOf('day')) == 0) {
            if (firstFound) {
                twoFirstEndOfDayTicks[1] = tick;
               //  console.log(tick);
                return twoFirstEndOfDayTicks;
            } else {
                twoFirstEndOfDayTicks[0] = tick;
                firstFound = true;
               //  console.log(tick);
            }
        }
    }
}

function getTwoSameTicks(data, twoFirstEndOfDayTicks) {
    console.log("twoFirstEndOfDayTicks");
    /*console.log("data");
    console.log(data);
    
    console.log(twoFirstEndOfDayTicks);*/
    sameTicks = new Array(2);
    var dataReversed = data.slice(0).reverse();
    firstFound = false;
    for (var i in dataReversed) {
        time = dataReversed[i].time;
       /* console.log("getTwoSameTicks time " + moment(time).format());
        console.log("getTwoSameTicks time0 " + twoFirstEndOfDayTicks[0].time.format());
        console.log("getTwoSameTicks time1 " + twoFirstEndOfDayTicks[1].time.format());
        console.log(moment(time).diff(twoFirstEndOfDayTicks[1].time));*/
        
        if (moment(time).diff(twoFirstEndOfDayTicks[0].time) == 0) {
            
                console.log("sameTicks r");
                sameTicks[0] = dataReversed[i];
                return sameTicks;
                }
         if (moment(time).diff(twoFirstEndOfDayTicks[1].time) == 0) {   
             
                //console.log("sameTicks 0");
                firstFound = true;
                sameTicks[1] = dataReversed[i];
            }
        
    }
}

function getNewDataStartIndex(newDataTime, data) {
    for (i in data) {
        if (moment(data[i].time).diff(newDataTime) == 0) {
            console.log("getNewDataStartIndex " + data[i].time.format() + " " + newDataTime);
            return Number(i) + 1;
        }
    }
}

function scaleAdjusting(lastDate, previousData) {

    previousData = previousData.reverse();
    console.log("scaleAdjusting start lastDate previousData " + lastDate + " " + previousData);
    daysDiff = moment().diff(lastDate, 'days');
    numberOfRequests = Math.ceil(daysDiff / 5);
    console.log(" scaleAdjusting numberOfRequests " + numberOfRequests);
    missingData = [];
    getDataAdjustAndConnect(numberOfRequests-1, missingData, previousData);

    
}

function getDataAdjustAndConnect(numberOfRequests, missingData, previousData) {
    return new Promise((resolve, reject) => {
        from = moment().subtract(5 * numberOfRequests + 7, 'days').toDate();
        to = moment().subtract(5 * numberOfRequests, 'days').toDate();
        method.getDataFromGoogleTrends(from, to).then(function (actualData) {
            console.log("scaleAdjusting from to size " + from + " " + to + " " + actualData.length+" "+numberOfRequests);
            twoFirstEndOfDayTicksInActualData = getTwoFirstEndOfDayTicks(actualData);
            //console.log("twoFirstEndOfDayTicksInActualData " + twoFirstEndOfDayTicksInActualData[0].time + " " + twoFirstEndOfDayTicksInActualData[1].time);
            sameTicksInPreviousData = getTwoSameTicks(previousData, twoFirstEndOfDayTicksInActualData);
            console.log("getTwoSameTicks times " + sameTicksInPreviousData[0].time + " " + sameTicksInPreviousData[1].time);
            console.log("getTwoSameTicks values " + sameTicksInPreviousData[0].value + " " + sameTicksInPreviousData[1].value);
            crossRequestRatio = twoFirstEndOfDayTicksInActualData[0].value / sameTicksInPreviousData[0].value;
            //console.log("crossRequestRatio " + crossRequestRatio);
            insideRequestRatioActual = twoFirstEndOfDayTicksInActualData[0].value / twoFirstEndOfDayTicksInActualData[1].value;
            //console.log("insideRequestRatioActual " + insideRequestRatioActual);
            insideRequestRatioPrevious = sameTicksInPreviousData[0].value / sameTicksInPreviousData[1].value;
            //console.log("insideRequestRatioPrevious " + insideRequestRatioPrevious);
            factorToBeNewRequestMultipliedBy = insideRequestRatioActual / insideRequestRatioPrevious / crossRequestRatio;
            //console.log("factorToBeNewRequestMultipliedBy " + factorToBeNewRequestMultipliedBy);
            //console.log(actualData);
            //console.log(actualData[0].value / actualData[1].value + " " + insideRequestRatioPrevious + " " + insideRequestRatioActual);
            actualData[0].value = actualData[0].value / crossRequestRatio;
            for (i = 1; i < actualData.length; i++) {
                actualData[i].value = actualData[i].value * factorToBeNewRequestMultipliedBy;
            }
            //console.log(actualData);
            //console.log(actualData[0].value / actualData[1].value + " " + insideRequestRatioPrevious + " " + insideRequestRatioActual);
            newDataStart = getNewDataStartIndex(twoFirstEndOfDayTicksInActualData[1].time, actualData);
            missingData = missingData.concat(actualData.slice(newDataStart));
            
            console.log("missingData");
            //console.log(missingData);
            if (numberOfRequests > 0) {
                getDataAdjustAndConnect(numberOfRequests - 1, missingData, actualData);
            } else {
                resolve(missingData);
            }
        });
    });

}


method.getData = function (fromDate, toDate) {

    return new Promise((resolve2, reject) => {
        method.getBetweenDates(fromDate, toDate).then(function (data) {
            return new Promise((resolve, reject) => {
                console.log("getBetweenDates1 " + data.length);
                if (data.length < 14) {
                    console.log("getBetweenDates2 " + data.length);
                    return resolve(method.getLastStoredWeekData());

                }
                return resolve(data);
            })
        }).then(function (data) {
            lastDate = data[0].time;
            resolve2(scaleAdjusting(lastDate, data));
        });
    });
    // method.insertDataMissingFrom(moment().subtract(1, 'weeks').startOf('isoWeek').toDate());
    // return method.getBetweenDates(moment().subtract(1, 'weeks').startOf('isoWeek').toDate(), new Date());

}

module.exports = Database;