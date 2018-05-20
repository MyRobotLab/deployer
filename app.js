/*
  FIXME - all meta data in publish location needs to be inside maven build (not jenkins) to do deployments
  outside of jenkins - some of these vars could be collected from the machine .. {hostname}.x86.windows etc


*/

var createError = require('http-errors');
var express = require('express');
var serveIndex = require('serve-index');
var favicon = require('serve-favicon');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var xml2js = require('xml2js');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var getDataRouter = require('./routes/getData');
var getJobsRouter = require('./routes/getJobs');
var getLatest = require('./routes/getLatest');
var getBuildNumberRouter = require('./routes/getBuildNumber');
var setBuildNumberRouter = require('./routes/setBuildNumber');

const util = require('util');

var schedule = require('node-schedule');

const fs = require('fs');

const xmlParser = new xml2js.Parser();

var branch = "";
var job = "";
var build = "";

var files = [];

// making it global without "var"
jobs = {};

// global vars (without var)
globalData = null;

// FIXME - only load buildNumbers (after inital rescan of dirs)
// file found - load it
// globalData = JSON.parse(fs.readFileSync("globalData.js", 'utf8'));

globalData = {};
globalData.branches = {};
globalData.jobs = jobs;
globalData.latest = {};
globalData.builds = {};


var buildsOrigin = "./builds/origin"

if (!fs.existsSync("./builds")){
    fs.mkdirSync("./builds");
}

if (!fs.existsSync(buildsOrigin)){
    fs.mkdirSync(buildsOrigin);
}

buildScanner = schedule.scheduleJob('*/1 * * * * *', function(){
//  console.log('scanning builds');

  var branchesFs = fs.readdirSync(buildsOrigin);
  var scannedJobs = {};
  // var scannedBuilds = [];

  branchesFs.forEach(function(branch){

//    console.log("branch : " + branch);
    var jobPath = buildsOrigin + "/" + branch;
    var jobsFs = fs.readdirSync(jobPath);


    if (globalData.latest[branch] == null){

      globalData.latest[branch] = {};
      globalData.latest[branch].number = 0;

      console.log(branch + " " + globalData.latest[branch].number);
      // globalData.latest.number = 0;
      //  console.log('set');
    }

    // console.log(branch);

    jobsFs.forEach(function(job){
      //  console.log("  job : " + job );
        var buildPath = jobPath + "/" + job;
        var newJob = {};
        newJob.name = job;
        newJob.builds = {};
        newJob.jobPath = jobPath;

        scannedJobs[job] = newJob;

        // build folders
        var builds = fs.readdirSync(buildPath);
        builds.forEach(function(buildFolderName){
            var propertiesPath = buildPath + "/" + buildFolderName + "/target/classes/git.properties";
            var buildKey = branch + "/" + job + "/" + buildFolderName;

            if (buildKey in globalData.builds){
              return;
            }

            console.log("      found new build at : " + buildKey );
            var newBuild = {};
            newBuild.key = buildKey;
            newBuild.name = buildFolderName;
            newBuild.data = null;
            newBuild.jobName = newJob.name;
            newBuild.tests = {};
            newBuild.tests.total = 0;
            newBuild.tests.errors = 0;
            newBuild.tests.failures = 0;
            newBuild.tests.skipped = 0;
            newBuild.tests.time = 0;

            try{
              // git properties
              newBuild.data = JSON.parse(fs.readFileSync(propertiesPath, 'utf8'));

              globalData.builds[newBuild.key] = newBuild;
              newBuild.commitKey = newBuild.data['git.commit.time'];

              // process test reports - update status
              var surefireReportDir = buildPath + "/" + buildFolderName + "/target/surefire-reports";
              fs.readdirSync(surefireReportDir).forEach(file => {
                if(path.extname(file) === ".xml") {

                  fs.readFile(surefireReportDir + '/' + file, function(err, data) {
                      xmlParser.parseString(data, function (err, result) {
                          newBuild.tests.total += parseInt(result.testsuite['$'].tests, 10);
                          newBuild.tests.errors += parseInt(result.testsuite['$'].errors, 10);
                          newBuild.tests.failures += parseInt(result.testsuite['$'].failures, 10);
                          newBuild.tests.skipped += parseInt(result.testsuite['$'].skipped, 10);
                          newBuild.tests.time += parseInt(result.testsuite['$'].time, 10);
                      });
                  });
                  //console.log(file);
                }
              })

              // checking if "Latest" - which is first build of last commit
              // console.log(branch);
              // FIXME - use commitKey
              if (globalData.latest[branch].gitCommitTime == null ||
                  globalData.latest[branch].gitCommitTime < newBuild.data['git.commit.time']){

                // found a new "latest" - FIXME - redundant but getBuildNumber depends on it
                globalData.latest[branch].gitCommitTime = newBuild.data['git.commit.time'];
                globalData.latest[branch].number++;
                globalData.latest[branch].jobName = newJob.name;
                globalData.latest[branch].buildName = newBuild.name;

                // nice ! associate the "latest" (first committed build of a unique git commit time)
                globalData.latest[branch].build = newBuild;
                fs.writeFileSync("globalData.js", JSON.stringify(globalData));
              }

            } catch(e2){
              //console.log(e2);
            }
            // newJob.builds.push(newBuild);
        })
    })
  });

  // this was painful - you can sort here - dunno why
  // globalData.builds = scannedBuilds;
  // console.log("here");
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
app.use('/getLatest', getLatest);
app.use('/getBuildNumber', getBuildNumberRouter);
app.use('/setBuildNumber', setBuildNumberRouter);
app.use('/builds', express.static('builds'), serveIndex('builds', {'icons': true}));

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

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
