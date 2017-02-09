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

function _getSitesForPark(parkId) {
  return Sites()
    .where({ park_id: parseInt(parkId) })
    .orderBy('sites.id')
    .map(({ id }) => id);
}


module.exports = {
  getAllParks,
  getSinglePark,
  _getSitesForPark
};
