var knex = require('./knex.js');
var moment = require('moment');

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
    .orderBy('id');
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

function _getCampDatesForSites(siteIds, endDate, startDate) {
  // Defaults to Next 2 Weeks
  let end = endDate || moment().add(14, 'day').format('YYYY-MM-DD');
  let start = startDate || moment().format('YYYY-MM-DD');

  return CampDates()
    .whereIn('site_id', siteIds)
    .whereBetween('date', [start, end])
    .orderBy('id');
}

function getAllCampDates(endDate, startDate) {
  // Defaults to Next 2 Weeks
  let end = endDate || moment().add(14, 'day').format('YYYY-MM-DD');
  let start = startDate || moment().format('YYYY-MM-DD');

  return CampDates()
    .whereBetween('date', [start, end])
    .select();
}

function getCampDatesBy(attributes = {}, endDate, startDate) {
  // Defaults to Next 2 Weeks
  let end = endDate || moment().add(14, 'day').format('YYYY-MM-DD');
  let start = startDate || moment().format('YYYY-MM-DD');

  return CampDates()
    .where(attributes)
    .whereBetween('date', [start, end])
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
