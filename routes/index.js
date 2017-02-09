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

// *** GET single park *** //
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

// *** GET all sites *** //
router.get('/sites', function(req, res, next) {
  let body = {};
  queries.getAllSites()
    .then(function(sites) {
      Object.assign(body, { sites });
      return queries._getCampDatesForSites(sites.map(({id}) => id));
    })
    .then(function(campDates) {
      body.sites = body.sites.map((site) => {
        site.park = site.park_id;
        delete site.park_id;

        let campDateIds = campDates
            .filter((campDate) => campDate.site_id === site.id)
            .map(({id}) => id);
        return Object.assign({}, site, {
          camp_dates: campDateIds
        });
      });

      res.status(200).json(body);
    })
    .catch(function(error) {
      next(error);
    });
});

// *** GET single site *** //
router.get('/sites/:id', function(req, res, next) {
  let body = {};
  queries.getSingleSite(req.params.id)
    .then(function(site) {
      Object.assign(body, { site });
      return queries._getCampDatesForSites(site.id);
    })
    .then(function(campDates) {
      let site = body.site;
      let campDateIds = campDates
          .filter((campDate) => campDate.site_id === site.id)
          .map(({id}) => id);
      Object.assign(site, {
        camp_dates: campDateIds,
        park: site.park_id
      });

      delete site.park_id;

      res.status(200).json(body);
    })
    .catch(function(error) {
      next(error);
    });
});

// *** GET single camp_date *** //
router.get('/camp_dates/:id', function(req, res, next) {
  let body = {};
  queries.getSingleCampDate(req.params.id)
    .then(function(campDate) {
      campDate.site = campDate.site_id;
      delete campDate.site_id;

      Object.assign(body, { camp_date: campDate });
      res.status(200).json(body);
    })
    .catch(function(error) {
      next(error);
    });
});


module.exports = router;
