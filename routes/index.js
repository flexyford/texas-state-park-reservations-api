var express = require('express');
var router = express.Router();

var queries = require('../db/queries');


// *** GET all parks *** //
router.get('/parks', function(req, res, next) {
  queries.getAll()
    .then(function(parks) {
      res.status(200).json(parks);
    })
    .catch(function(error) {
      next(error);
    });
});


module.exports = router;
