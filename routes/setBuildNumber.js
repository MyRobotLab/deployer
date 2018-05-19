var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {

  res.contentType("text");

  var branch = req.param("branch");
  if (branch == null){
    branch = "develop";
  }

  var buildNumber = req.param("buildNumber");
  if (buildNumber == null){
    res.send("buildNumber parameter required");
    return;
  }

  globalData.latest[branch].number = parseInt(buildNumber, 10);
  // var globalBuildNumber = 5;
  res.send("global.build.number=" + globalData.latest[branch].number + "\n");
});

module.exports = router;
