var moment = require('moment');
var request = require('request');
var cheerio = require('cheerio');

const PARKS = require('../fixtures')['parks'];

exports.seed = function(knex, Promise) {
  let $;
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
          }).returning('*');
        })
      );
    })
    .then(function(parks) {
      parks = parks.map(([park]) => park);
      // Build Sites
      const calendarUrl = `http://texas.reserveworld.com/GeneralAvailabilityCalendar.aspx`;
      let requests = parks
          .filter((park) => park.reserveworld_camp_ids)
          .map((park, index) => {
            let reserveworldCampIds = park.reserveworld_camp_ids.split(',');
            return reserveworldCampIds.map(function(campId) {
              // Request Reserve World Calendar
              let date = moment().format('MM/DD/YYYY');
              let url = calendarUrl + `?campId=${campId}&arrivalDate=${date}`;

              return new Promise(function(resolve, reject) {
                request(url, function(error, response, html) {
                  if(!error) {
                    resolve({
                      park,
                      reserveworldCampId: campId,
                      html
                    });
                  } else {
                    reject({ error });
                  }
                });
              });
            });
          })
          .reduce(function(requests, reqArray) {
            // Flatten Request Array
            return requests.concat(reqArray);
          }, []);

      return Promise.all(requests);
    })
    .then(function(responses) {
      let { park, reserveworldCampId, response } = responses;
      let parkPromises = responses.map(({ park, reserveworldCampId, html }) => {
        $ = cheerio.load(html);

        // We'll use the unique table
        let $table = $('table[summary]');
        let $rows = $table.find('tr');

        let $data = $rows.slice(2);

        let sites = $data.map(function() {
          return {
            type: $(this).find('td').eq(0).text(),
            pet: $(this).find('td').eq(1).text() === 'Yes',
            electric: $(this).find('td').eq(2).text() === 'Yes',
            water: $(this).find('td').eq(3).text() === 'Yes',
            sewer: $(this).find('td').eq(4).text() === 'Yes',
            reserveworld_camp_id: reserveworldCampId
          };
        }).toArray();

        let sitePromises = sites.map((site, index) => {
          let {type, pet, electric, water, sewer, reserveworld_camp_id} = site;

          let $headers = $rows.eq(1).find('td');
          let $dates = $headers.slice(5); // 5 is the Index of Dates
          let $row = $data.eq(index);

          return knex('sites').insert({
            type,
            pet,
            electric,
            water,
            sewer,
            reserveworld_camp_id,
            park_id: park.id
          }).returning('*').then(([ site ]) => {
            let dates = $dates.map(function(idx) {
              let date = $(this).text();
              let momentDate = moment(date, "MM/DD");

              // Assumes we never scrape more than 11 months in advance
              if (momentDate.month() < moment().month()) {
                momentDate = momentDate.add(1, 'year');
              }

              let offset = idx + 5;

              let $row = $data.eq(index);
              let available = $row.find('td').eq(offset).text();

              return {
                date: momentDate.format(),
                available,
                site_id: site.id
              };
            }).toArray().reduce(function(dates, datesForSite) {
              // Flatten Request Array
              return dates.concat(datesForSite);
            }, []);

            let datePromises = dates.map(({date, available, site_id}) => {
              return knex('camp_dates').insert({
                date, available, site_id
              });
            });

            return Promise.all(datePromises);
          });
        });

        return Promise.all(sitePromises);
      });

      return Promise.all(parkPromises);
    });
};
