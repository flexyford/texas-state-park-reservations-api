var moment = require('moment');
const PARKS = require('../fixtures')['parks'];

exports.seed = function(knex, Promise) {
  let deleteAll = knex('camp_dates').del()
      .then(() => knex('sites').del())
      .then(() => knex('parks').del());

  return deleteAll // Deletes ALL existing entries
    .then(function() {
      // Inserts parks seed entries
      return Promise.all(
        Object.keys(PARKS).map((name) => {
          return knex('parks').insert({
            name,
            reserveworld_camp_ids: PARKS[name]
          });
        })
      );
    })
    .then(function() {
      // Finds Enchanted Rock Park
      return knex('parks').where({
        name: 'ENCHANTED ROCK SNA'
      }).first();
    })
    .then(function(park) {
      // Build Enchanted Rock Sites
      let reserveworldCampId = park.reserveworld_camp_ids.split(',')[0];
      return Promise.all([
        knex('sites').insert({
          type: "WATER ONLY CAMPSITE",
          pet: true,
          electric: false,
          water: true,
          sewer: false,
          reserveworld_camp_id: reserveworldCampId,
          park_id: park.id
        }),
        knex('sites').insert({
          type: "PRIMITIVE HIKE-IN",
          pet: true,
          electric: false,
          water: false,
          sewer: false,
          reserveworld_camp_id: reserveworldCampId,
          park_id: park.id
        }),
        knex('sites').insert({
          type: "OVERFLOW SITES",
          pet: true,
          electric: false,
          water: false,
          sewer: false,
          reserveworld_camp_id: reserveworldCampId,
          park_id: park.id
        })
      ]);
    })
    .then(function() {
      // Find Enchanted Rock Sites
      return knex('sites');
    })
    .then(function(sites) {
      // Build Enchanted Rock Site Camp Dates
      let days = [1,2,3,4,5,6,7];

      let campDates = sites.reduce((campDates, site, index) => {
        let dates = days.map((day) => {
          let available = (days.length * index) + day;
          return knex('camp_dates').insert({
            date: moment().add(day, 'day').format(),
            available,
            site_id: site.id
          });
        });

        return campDates.concat(dates);
      }, []);

      return Promise.all(campDates);
    });
};
