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
  res.send('buildNumber=3\nbranch=' + req.param("branch"));
});

module.exports = router;
