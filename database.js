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
    var results = [];

    if (!db) {
        initDb(function (err) {});
    }

    if (db) {
        var mysort = {date: 1};
        db.collection("interest").find().sort(mysort).limit(2).toArray(function (err, result) {
            if (err)
                throw err;
            console.log(result);
            results.push(result);
            db.close();
        });
    }
    return results;
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
            console.log(normalizedGoogleTrendsTimeline);
            db.collection("interest").insertMany(normalizedGoogleTrendsTimeline, function (err, res) {
                if (err)
                    throw err;
                console.log("Number of documents inserted: " + res.insertedCount);
                db.close();
            });
        })
    }

}

module.exports = Database;