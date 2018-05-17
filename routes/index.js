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
  // FIXME - just globalData :P - unless its filtering being applied
  res.render('index', { title: 'Cookie Factory !', globalData:globalData, latest:globalData.latest.develop.build, builds:globalData.builds });

});

module.exports = router;
