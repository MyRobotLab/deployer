var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {

  console.log()

  // input must be branch !!!

  // read file
  // contents are :
  //   buildNumber=x,
  //   gitCommitTime=YYYY.

  res.contentType("text");

  content = "";

  var branch = req.param("branch");
  if (branch != null){
    content += "branch=" + branch + "\n";
  }

  var globalUsername = req.param("username");
  if (globalUsername != null){
    content += "global.username=" + globalUsername + "\n";
  }

  var globalPlatform = req.param("platform");
  if (globalPlatform != null){
    content += "global.platform=" + globalPlatform + "\n";
  }

  var globalBuildNumber = 5;

  res.send("global.build.number=" + globalBuildNumber + "\n" + content);
});

module.exports = router;
