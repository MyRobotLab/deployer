var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  // res.send(jobs);

  var branch = req.param("branch");
  if (branch == null){
    branch = "develop";
  }

  var status = "error";
  if (globalData.latest[branch].build.tests.errors == 0){
    status = "success";
  }

  var url = "http://build.myrobotlab.org:8888/images/icon_"+status+"_sml.gif";

  // res.send("http://build.myrobotlab.org:8888/images/icon_"+status+"_sml.gif");
  res.redirect(url);

});

module.exports = router;
