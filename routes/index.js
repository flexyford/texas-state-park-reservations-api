var express = require('express');
var router = express.Router();

var queries = require('../db/queries');

// *** GET all parks *** //
router.get('/parks', function(req, res, next) {
  let body = {};
  queries.getAllParks()
    .then(function(parks) {
      // Filter By Query Params
      let name = req.query.name;
      if (!name) return parks;
      let re = new RegExp(name, 'i');
      return parks.filter((park) => {
        return park.name.match(re);
      });
    })
    .then(function(parks) {
      Object.assign(body, { parks });
      return queries._getSitesForParks(parks.map((p) => p.id));
    })
    .then(function(sites) {
      // Sideload Sites Ids
      body.parks = body.parks.map((p) => {
        let siteIds = sites.filter((s) => s.park_id === p.id).map(({id}) => id);
        return Object.assign({}, p, { sites: siteIds });
      });

      // Sideload Sites
      body.sites = sites.map((s) => {
        let site = Object.assign({}, s, { park: s.park_id });
        delete site.park_id;
        return site;
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
      // Sideload Site Ids
      let park = body.park;
      let siteIds = sites.map(({ id }) => id);
      Object.assign(park, { sites: siteIds });

      // Sideload Sites
      body.sites = sites.map((s) => {
        let site = Object.assign({}, s, { park: s.park_id });
        delete site.park_id;
        return site;
      });

      res.status(200).json(body);
    })
    .catch(function(error) {
      next(error);
    });
});

// *** GET single park's sites *** //
router.get('/parks/:id/camp_dates', function(req, res, next) {
  let body = {};
  queries.getSinglePark(req.params.id)
    .then(function(park) {
      Object.assign(body, { park });
      return queries._getSitesForParks(park.id);
    })
    .then(function(sites) {
      // Sideload Site Ids
      let park = body.park;
      let siteIds = sites.map(({ id }) => id);
      Object.assign(park, { sites: siteIds });

      // Sideload Sites
      body.sites = sites.map((s) => {
        let site = Object.assign({}, s, { park: s.park_id });
        delete site.park_id;
        return site;
      });

      return queries._getCampDatesForSites(sites.map(({ id }) => id));
    })
    .then(function(campDates) {
      // Sideload CampDate Ids
      body.sites = body.sites.map((site) => {
        let campDateIds = campDates
            .filter((campDate) => campDate.site_id === site.id)
            .map(({id}) => id);
        return Object.assign({}, site, { camp_dates: campDateIds });
      });

      // Sideload CampDates
      body.camp_dates = campDates.map((date) => {
        let campDate = Object.assign({}, date, { site: date.site_id });
        delete campDate.park_id;
        return campDate;
      });

      res.status(200).json(body);
    })
    .catch(function(error) {
      next(error);
    });
});

// *** GET single park's sites *** //
router.get('/parks/:id/sites', function(req, res, next) {
  let body = {};
  queries.getSinglePark(req.params.id)
    .then(function(park) {
      Object.assign(body, { park });
      return queries._getSitesForParks(park.id);
    })
    .then(function(sites) {
      // Sideload Site Ids
      let park = body.park;
      let siteIds = sites.map(({ id }) => id);
      Object.assign(park, { sites: siteIds });

      // Sideload Sites
      body.sites = sites.map((s) => {
        let site = Object.assign({}, s, { park: s.park_id });
        delete site.park_id;
        return site;
      });

      return queries._getCampDatesForSites(sites.map(({ id }) => id));
    })
    .then(function(campDates) {
      Object.assign(body, { camp_dates: campDates });

      body.sites = body.sites.map((site) => {
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
