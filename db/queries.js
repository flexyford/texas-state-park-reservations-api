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

function _getSitesForParks(parkIds) {
  return Sites()
    .whereIn('park_id', parkIds)
    .orderBy('id')
    .map(({ id, park_id }) => { return { id, park_id }; });
}

function getAllSites() {
  return Sites().select();
}

function getSingleSite(id) {
  return Sites()
    .where('id', parseInt(id))
    .first();
}

function _getCampDatesForSites(siteIds) {
  return CampDates()
    .whereIn('site_id', siteIds)
    .orderBy('id')
    .map(({ id, site_id }) => { return { id, site_id }; });
}

function getSingleCampDate(id) {
  return CampDates()
    .where('id', parseInt(id))
    .first();
}


module.exports = {
  getAllParks,
  getSinglePark,
  _getSitesForParks,
  getAllSites,
  getSingleSite,
  _getCampDatesForSites,
  getSingleCampDate
};
