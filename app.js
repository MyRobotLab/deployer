var createError = require('http-errors');
var express = require('express');
var serveIndex = require('serve-index')
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

const util = require('util');

var schedule = require('node-schedule');

const fs = require('fs');

var branch = "";
var job = "";
var build = "";

var files = [];

// making it global without "var"
jobs = {};

globalData = "GLOBAL DATA !";

buildScanner = schedule.scheduleJob('*/1 * * * * *', function(){
//  console.log('scanning builds');

/* works .... sort of ...
  recursive("./builds/origin", function (err, files) {
    // `files` is an array of file paths
    console.log(files);
  });
  console.log(files);
*/
  var basePath = "./builds/origin";
  var branchesFs = fs.readdirSync(basePath);
  branchesFs.forEach(function(branch){
//    console.log("  branch : " + branch);
    var jobPath = basePath + "/" + branch;
    var jobsFs = fs.readdirSync(jobPath);
    jobsFs.forEach(function(job){
        var buildPath = jobPath + "/" + job;
//        console.log("    job : " + job );
        var newJob = {};
        newJob.name = job;
        jobs[job] = newJob;
        newJob['builds'] = [];
        newJob['latest'] = "";
        // jobs.push(job);
        var builds = fs.readdirSync(buildPath);
        builds.forEach(function(build){
            var propertiesPath = buildPath + "/" + build + "/classes/git.properties";
//            console.log("      build : " + build );
            var newBuild = {};
            newBuild['name'] = build;
            newBuild['json'] = "";
            newBuild['data'] = null;

            fs.readFile(propertiesPath, 'utf8', function (err, data) {
              if (err) {
                // return console.log(err);
              } else {
                // git properties
                newBuild['json'] = data; // TODO - get rid of this (or display on expand)

                try {
                    newBuild['data'] = JSON.parse(data);
                    console.log(newBuild.data['git.branch']);
                    // console.log(newJob);
                } catch(e) {
                    // alert(e); // error in the above string (in this case, yes)!
                    console.log(e);
                }
              }

            });

            console.log(newBuild['json']);
            console.log(util.inspect(newBuild['json'], false, null))
            newJob['latest'] = newBuild;
            newJob.builds.push(newBuild);
            // console.log(newBuild['data']);
            // var builds = fs.readdirSync(jobPath);
        })
    })
  });

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
