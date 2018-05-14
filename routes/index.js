var express = require('express');
var router = express.Router();

// build key comparison - reverse sort
function compare(a,b) {
  console.log("not here");
  // console.log("key: " + a.name);
  // return a.name < b.name;
  let comparison = 0;
  if (a.key < b.key) {
    comparison = 1;
  } else if (a.key > b.key) {
    comparison = -1;
  }
  return comparison;
}

/* GET home page. */
router.get('/', function(req, res, next) {

  globalData.builds.sort(compare);

  res.render('index', { title: 'Cookie Factory !', globalData:globalData, builds:globalData.builds });

});

module.exports = router;
