var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

  console.log(globalData);
  res.render('index', { title: 'Cookie Factory !', test:globalData, displayJobs:jobs });

});

module.exports = router;
