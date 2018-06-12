var express = require('express');
var router = express.Router();
const fs = require('fs');

/* GET users listing. */
router.get('/', function(req, res, next) {

  res.contentType("text");

  var ipaddress = req.param("ipaddress");

  // set and save
  if (ipaddress != null){
    globalData.ipaddress = parseInt(ipaddress, 10);
    fs.writeFileSync("globalData.json", JSON.stringify(globalData));
  }

  // var globalBuildNumber = 5;
  res.send("global.ipaddress=" + globalData.ipaddress + "\n");

});

module.exports = router;
