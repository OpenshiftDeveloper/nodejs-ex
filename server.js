//  OpenShift sample Node application
var express = require('express'),
    app     = express(),
    morgan  = require('morgan');
    
Object.assign=require('object-assign')

var moment = require('moment');
const coindesk = require('node-coindesk-api');
const googleTrends = require('google-trends-api');

var DataSeriesNormalizer = require("./dataSeriesNormalizer.js");
var ChartModelProducer = require("./chartModelProducer.js");





app.engine('html', require('ejs').renderFile);

app.use('/node_modules', express.static(__dirname + '/node_modules'));
app.use('/resources', express.static(__dirname + '/resources'));
app.use('/app', express.static(__dirname + '/app.js'));

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
  var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
      mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
      mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
      mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
      mongoPassword = process.env[mongoServiceName + '_PASSWORD']
      mongoUser = process.env[mongoServiceName + '_USER'];

  if (mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = 'mongodb://';
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ':' + mongoPassword + '@';
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;

  }
}
var db = null,
    dbDetails = new Object();

var initDb = function(callback) {
  if (mongoURL == null) return;

  var mongodb = require('mongodb');
  if (mongodb == null) return;

  mongodb.connect(mongoURL, function(err, conn) {
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



app.get('/', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  
  if (db) {
    var col = db.collection('counts');
    // Create a document with request IP and current time of request
    col.insert({ip: req.ip, date: Date.now()});
    col.count(function(err, count){
      if (err) {
        console.log('Error running count. Message:\n'+err);
      }      
      res.render('index.html', { pageCountMessage : count, dbInfo: dbDetails});      
    });
  } else {      
      res.render('index.html', { pageCountMessage : null});      
  }
});



app.get('/cronjob_69637.html', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    res.send('cronjob.de');
  } else {
    res.send('cronjob.de');
  }
});

app.get('/pagecount', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    db.collection('counts').count(function(err, count ){
      res.send('{ pageCount: ' + count + '}');
    });
  } else {
    res.send('{ pageCount: -1 }');
  }
});

app.get('/chartmodel', function (req, res) {
    
    console.log(req.param("startTime"));
    console.log(req.param("endTime"));
    var startTime = moment.utc(req.param("startTime")).toDate();
    var endTimeMoment = moment.utc(req.param("endTime"));
    var endTime = endTimeMoment.toDate();
    weekAgoTime = endTimeMoment.clone().subtract(5, 'days').toDate();
    console.log(startTime);
    console.log(endTime);
    console.log(weekAgoTime);
    //startTime = new Date(Date.now() - (daysBack * 24 * 60 * 60 * 1000));
    options = new Object();
    options.start = startTime;
    options.end = endTime;    
     Promise.all([coindesk.getHistoricalClosePrices(options),
         googleTrends.interestOverTime({
    keyword: 'bitcoin',  startTime: startTime,  endTime: endTime,granularTimeResolution: true,granularTimeResolution: true, timezone :"0"})
    ,    googleTrends.interestOverTime({
    keyword: 'bitcoin',  startTime: weekAgoTime,  endTime: endTime,granularTimeResolution: true,granularTimeResolution: true, timezone :"0"}),
coindesk.getCurrentPrice()
    ]).then(function(values) {
    //console.log(values[0]);
    console.log(values[1]);
    console.log(values[2]);
    //console.log(values[3]);
    var chartModelProducer = new ChartModelProducer();
    var dataSeriesNormalizer = new DataSeriesNormalizer();
    normalizedCoinDesk = dataSeriesNormalizer.normalizeCoinDesk(values[0],values[3]);    
    normalizedGoogleTrends = dataSeriesNormalizer.normalizeGoogleTrends(values[1],values[2]);     
    //console.log(normalizedCoinDesk);
    //console.log(normalizedGoogleTrends);
   
    
    chartModel = chartModelProducer.getChartModel(normalizedGoogleTrends, normalizedCoinDesk);
    res.send(chartModel);
});
});

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

initDb(function(err){
  console.log('Error connecting to Mongo. Message:\n'+err);
});

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;
