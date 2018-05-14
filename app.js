/*
  FIXME - all meta data in publish location needs to be inside maven build (not jenkins) to do deployments
  outside of jenkins - some of these vars could be collected from the machine .. {hostname}.x86.windows etc


*/

var createError = require('http-errors');
var express = require('express');
var serveIndex = require('serve-index')
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var getDataRouter = require('./routes/getData');
var getJobsRouter = require('./routes/getJobs');
var getBuildNumberRouter = require('./routes/getBuildNumber');

const util = require('util');

var schedule = require('node-schedule');

const fs = require('fs');

var branch = "";
var job = "";
var build = "";

var files = [];

// making it global without "var"
jobs = {};

// global vars (without var)
globalData = {};
globalData.branches = {};
globalData.jobs = jobs;

buildScanner = schedule.scheduleJob('*/1 * * * * *', function(){
//  console.log('scanning builds');

  var basePath = "./builds/origin";
  var branchesFs = fs.readdirSync(basePath);
  var scannedJobs = {};
  var scannedBuilds = [];

  branchesFs.forEach(function(branch){

//    console.log("branch : " + branch);
    var jobPath = basePath + "/" + branch;
    var jobsFs = fs.readdirSync(jobPath);

    jobsFs.forEach(function(job){
      //  console.log("  job : " + job );
        var buildPath = jobPath + "/" + job;
        var newJob = {};
        newJob.name = job;
        newJob.builds = [];
        newJob.jobPath = jobPath;

        scannedJobs[job] = newJob;

        // build folders
        var builds = fs.readdirSync(buildPath);
        builds.forEach(function(buildFolderName){
            // console.log("      buildFolderName : " + buildFolderName );
            var propertiesPath = buildPath + "/" + buildFolderName + "/classes/git.properties";

            var newBuild = {};
            newBuild.name = buildFolderName;
            newBuild.data = null;
            newBuild.jobName = newJob.name;

            // git.properties
            fs.readFile(propertiesPath, 'utf8', function (err, data) {
              if (err) {
                // return console.log(err);
              } else {
                // git properties
                // newBuild['json'] = data; // TODO - get rid of this (or display on expand)

                try {
                    newBuild.data = JSON.parse(data);
                    // globalData.branches[newBuild.data['git.branch']] = newBuild;

                    newBuild.key = branch + "/" + newBuild.data['git.commit.time'] + "/" + job + "/" + newBuild.name;

                    // winner winner chicken dinner
                    scannedBuilds.push(newBuild);
                    // console.log(scannedBuilds);
                } catch(e) {
                    // alert(e); // error in the above string (in this case, yes)!
                    // no git.properties :(
                    console.log(e);
                }
              }
            });

            // newJob.builds.push(newBuild);
        })
    })
  });

  //jobs = scannedJobs;
  // globalData.jobs = scannedJobs;
  // console.log(scannedBuilds);
  /*
  scannedBuilds.sort(function(a,b) {
    console.log("key: " + a.key);
    return a.key < b.key;
  }); */
  // console.log("key: ");
  // compare({"name":"1"}, {"name":"2"});
  globalData.builds = scannedBuilds;
  console.log("here");
});

// making it global (bad practice - but necessary for managing 2 threads)
// var app = express();
var app = express();

app.set('port', process.env.PORT || 8888);
app.listen(app.get('port'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/getData', getDataRouter);
app.use('/getJobs', getJobsRouter);
app.use('/getBuildNumber', getBuildNumberRouter);
app.use('/builds', express.static('builds'), serveIndex('builds', {'icons': true}))

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
