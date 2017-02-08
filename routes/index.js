var express = require('express');
var router = express.Router();


// *** GET all shows *** //
router.get('/parks', function(req, res, next) {
  res.send('send parks back');
});


module.exports = router;
