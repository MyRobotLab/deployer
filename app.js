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
var xml2js = require('xml2js');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var getDataRouter = require('./routes/getData');
var getJobsRouter = require('./routes/getJobs');
var getBuildNumberRouter = require('./routes/getBuildNumber');

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

try {
  // file found - load it
  globalData = JSON.parse(fs.readFileSync("globalData.js", 'utf8'));
} catch(e){
  // file not found - load blank globalData
  globalData = {};
  globalData.branches = {};
  globalData.jobs = jobs;
  globalData.latest = {};
}

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
  var scannedBuilds = [];

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
        newJob.builds = [];
        newJob.jobPath = jobPath;

        scannedJobs[job] = newJob;

        // build folders
        var builds = fs.readdirSync(buildPath);
        builds.forEach(function(buildFolderName){
            // console.log("      buildFolderName : " + buildFolderName );
            var propertiesPath = buildPath + "/" + buildFolderName + "/target/classes/git.properties";

            var newBuild = {};
            newBuild.name = buildFolderName;
            newBuild.data = null;
            newBuild.jobName = newJob.name;
            newBuild.tests = {};
            newBuild.tests.total = 0;
            newBuild.tests.errors = 0;
            newBuild.tests.skipped = 0;
            newBuild.tests.failures = 0;
            newBuild.tests.time = 0;

            try{
              // git properties
              newBuild.data = JSON.parse(fs.readFileSync(propertiesPath, 'utf8'));
              newBuild.key = branch + "/" + newBuild.data['git.commit.time'] + "/" + job + "/" + newBuild.name;
              // console.log(branch);
              if (globalData.latest[branch].gitCommitTime == null ||
                  globalData.latest[branch].gitCommitTime < newBuild.data['git.commit.time']){
                globalData.latest[branch].gitCommitTime = newBuild.data['git.commit.time'];
                globalData.latest[branch].number++;
                fs.writeFileSync("globalData.js", JSON.stringify(globalData));
              }

              scannedBuilds.push(newBuild);

              var surefireReportDir = buildPath + "/" + buildFolderName + "/target/surefire-reports";
              fs.readdirSync(surefireReportDir).forEach(file => {
                if(path.extname(file) === ".xml") {

                  fs.readFile(surefireReportDir + '/' + file, function(err, data) {
                      xmlParser.parseString(data, function (err, result) {
                          // console.dir(result);
                          // console.log(result.testsuite['$']);
                          // console.log(result.testsuite['$'].tests);
                          newBuild.tests.total += parseInt(result.testsuite['$'].tests, 10);;
                          newBuild.tests.errors += parseInt(result.testsuite['$'].errors, 10);;
                      });
                  });
                  //console.log(file);
                }
              })

            } catch(e2){
              //console.log(e2);
            }
            // newJob.builds.push(newBuild);
        })
    })
  });

  // this was painful - you can sort here - dunno why
  globalData.builds = scannedBuilds;
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
