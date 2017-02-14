var knex = require('./knex.js');

function Parks() {
  return knex('parks');
}

function Sites() {
  return knex('sites');
}

function CampDates() {
  return knex('camp_dates');
}

// *** queries *** //

function getAllParks() {
  return Parks().select();
}

function getSinglePark(id) {
  return Parks()
    .where('id', parseInt(id))
    .first();
}

function getSingleParkBy(attributes = {}) {
  return Parks()
    .where(attributes)
    .first();
}

function _getSitesForParks(parkIds) {
  return Sites()
    .whereIn('park_id', parkIds)
    .orderBy('id')
    .map(({ id, park_id }) => { return { id, park_id }; });
}

function getAllSites() {
  return Sites().select();
}

function getSitesBy(attributes = {}) {
  return Sites()
    .where(attributes)
    .select();
}

function getSingleSite(id) {
  return Sites()
    .where('id', parseInt(id))
    .first();
}

function getSingleSiteBy(attributes = {}) {
  return Sites()
    .where(attributes)
    .first();
}

function _getCampDatesForSites(siteIds) {
  return CampDates()
    .whereIn('site_id', siteIds)
    .orderBy('id')
    .map(({ id, site_id }) => { return { id, site_id }; });
}

function getAllCampDates() {
  return CampDates().select();
}

function getCampDatesBy(attributes = {}) {
  return CampDates()
    .where(attributes)
    .select();
}

function getSingleCampDate(id) {
  return CampDates()
    .where('id', parseInt(id))
    .first();
}

function getSingleCampDateBy(attributes = {}) {
  return CampDates()
    .where(attributes)
    .first();
}


module.exports = {
  getAllParks,
  getSinglePark,
  getSingleParkBy,
  _getSitesForParks,
  getAllSites,
  getSitesBy,
  getSingleSite,
  getSingleSiteBy,
  _getCampDatesForSites,
  getAllCampDates,
  getCampDatesBy,
  getSingleCampDate,
  getSingleCampDateBy
};
