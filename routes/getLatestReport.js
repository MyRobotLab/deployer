var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  // res.send(jobs);

  var branch = req.param("branch");
  if (branch == null){
    branch = "develop";
  }
  var url = "/builds/origin/" + branch + "/" + globalData.latest[branch].jobName + "/" + globalData.latest[branch].build.name + "/target/site/surefire-report.html";
  console.log(url);
  // http://build.myrobotlab.org:8888/builds/origin/develop/myrobotlab-grog-x86.64.linux-work-e/79/target/
  res.redirect(url);
  // res.send(url);
});

module.exports = router;
