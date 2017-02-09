var knex = require('./knex.js');

function Parks() {
  return knex('parks');
}

function Sites() {
  return knex('sites');
}

// *** queries *** //

function getAllParks() {
  return Parks().select();
}

function getSinglePark(parkId) {
  return Parks()
    .where('id', parseInt(parkId))
    .first();
}

function _getSitesForParks(parkIds) {
  return Sites()
    .whereIn('park_id', parkIds)
    .orderBy('id')
    .map(({ id, park_id }) => { return { id, park_id }; });
}


module.exports = {
  getAllParks,
  getSinglePark,
  _getSitesForParks
};
