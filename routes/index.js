var express = require('express');
var router = express.Router();

var queries = require('../db/queries');


// *** GET all parks *** //
router.get('/parks', function(req, res, next) {
  let body = {};
  queries.getAllParks()
    .then(function(parks) {
      Object.assign(body, { parks });
      return queries._getSitesForParks(parks.map((p) => p.id));
    })
    .then(function(sites) {
      body.parks = body.parks.map((p) => {
        let siteIds = sites.filter((s) => s.park_id === p.id).map(({id}) => id);
        return Object.assign({}, p, { sites: siteIds });
      });

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
      return queries._getSitesForParks(park.id);
    })
    .then(function(sites) {
      let park = body.park;
      let siteIds = sites.filter((s) => s.park_id === park.id).map(({id}) => id);
      Object.assign(park, { sites: siteIds });

      res.status(200).json(body);
    })
    .catch(function(error) {
      next(error);
    });
});


module.exports = router;
