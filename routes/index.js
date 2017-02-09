var express = require('express');
var router = express.Router();

var queries = require('../db/queries');


// *** GET all parks *** //
router.get('/parks', function(req, res, next) {
  queries.getAllParks()
    .then(function(parks) {
      let body = {
        parks: parks
      };

      res.status(200).json(body);
    })
    .catch(function(error) {
      next(error);
    });
});

// *** GET single parks *** //
router.get('/parks/:id', function(req, res, next) {
  let body = {};
  queries.getSinglePark(req.params.id)
    .then(function(park) {
      Object.assign(body, { park });
    })
    .then(function() {
      return queries._getSitesForPark(req.params.id);
    })
    .then(function(sites) {
      Object.assign(body.park, { sites });
      res.status(200).json(body);
    })
    .catch(function(error) {
      next(error);
    });
});


module.exports = router;
