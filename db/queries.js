var knex = require('./knex.js');

function Parks() {
  return knex('parks');
}

// *** queries *** //

function getAll() {
  return Parks().select();
}


module.exports = {
  getAll: getAll
};
