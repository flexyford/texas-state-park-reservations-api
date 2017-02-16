var moment = require('moment');
var request = require('request');
var cheerio = require('cheerio');

var knex = require('../db/knex.js');
let queries = require('../db/queries');

const ROW = {
  TYPE: 0,
  DATES_START: 5,
  DATES_END: 19
};

const DAYS_PER_CALENDAR_VIEW = 14;

function findSiteBy(attributes = {}) {
  return queries.getSingleSiteBy(attributes);
}

function getRowData($row, start, end) {
  if (!end) {
    return $row.find('td').eq(start).text();
  } else {
    let $ = this;

    return $row.find('td').slice(start, end).map(function(i, e) {
      return $(this).text();
    }).toArray();
  }
}

function createOrUpdateCampDate(attributes) {
  let { date, available, site_id } = attributes;
  let campDateQuery = queries.getSingleCampDateBy({
    date, site_id
  });

  return campDateQuery.then((campDate) => {
    if (!campDate) {
      return knex('camp_dates').insert({
        date: moment(date).format(),
        available,
        site_id
      });
    } else if (parseInt(campDate.available) !== parseInt(available)) {
      return campDateQuery.update({
        available,
        updated_at: knex.fn.now()
      });
    } else {
      return campDate;
    }
  });
}

function parseRow($row, $header, reserveWorldCampId) {
  let $ = this;
  let type = getRowData.call($, $row, ROW.TYPE);
  let siteAttrs = { type,  reserveworld_camp_id: reserveWorldCampId };

  return findSiteBy(siteAttrs).then((site) => {

    let campDates = getRowData.call($, $header, ROW.DATES_START, ROW.DATES_END).map((date, i) => {
      let available = getRowData.call($, $row, ROW.DATES_START + i);

      return createOrUpdateCampDate({
        date: moment(date, 'MM/DD').format('YYYY-MM-DD'),
        available: available,
        site_id: site.id
      });
    });

    return Promise.all(campDates);
  });
}

function parseCalendar(url, html) {
  let reserveWorldId = url.match(/campId=(\d+)/).pop();

  let $ = cheerio.load(html);

  let $table = $('table[summary]');
  let $rows = $table.find('tr');

  let $header = $rows.eq(1);

  let promiseDates = $rows.slice(2).map(function() {
    return parseRow.call($, $(this), $header, reserveWorldId);
  }).toArray();

  return Promise.all(promiseDates);
}

function requestCalendar(url) {
  return new Promise(function(resolve, reject) {
    request(url, function(error, response, html) {
      if(!error) {
        resolve(html);
      } else {
        reject(error);
      }
    });
  });
}

function requestCalendars(urls) {
  let requests = urls.map((url) => {
    return requestCalendar(url)
      .then((html) => {
        // console.log('parsing: ', url);
        return parseCalendar(url, html);
      })
      .catch((error) => {
        console.log("Error: ", error, ' ', url);
      });
  });

  return Promise.all(requests)
    .catch((error) => {
      console.log("Error: ", error);
    });
}

function buildReservationsForCamp(campId, arrivalDate, departureDate) {
  const calendarUrl = `http://texas.reserveworld.com/GeneralAvailabilityCalendar.aspx`;

  let from = moment(arrivalDate);
  let to = moment(departureDate);
  let duration = to.diff(from, 'days');

  let numViews = Math.ceil(duration / DAYS_PER_CALENDAR_VIEW);

  let arrivalDates = new Array(numViews).fill( null ).map((_, index) => {
    let from = moment(arrivalDate);
    let days = DAYS_PER_CALENDAR_VIEW * index;
    return from.add(days, 'days');
  });

  let urls = arrivalDates.map((date) => {
    let arrivalDate = date.format('MM/DD/YYYY');
    return calendarUrl + `?campId=${campId}&arrivalDate=${arrivalDate}`;
  });

  return requestCalendars(urls);
}

function buildReservationsForPark(park, arrivalDate, departureDate) {
  console.log(`Scraping ${park.name} . . . `);

  let reserveworldCampIds = park.reserveworld_camp_ids ?
    park.reserveworld_camp_ids.split(',') : [];

  return Promise.all(
    reserveworldCampIds.map((reserveworldCampId) => {
      return buildReservationsForCamp(
        reserveworldCampId, arrivalDate, departureDate
      );
    })
  );
}

function buildReservationsForParks(parks, arrivalDate, departureDate) {
  return Promise.all(
    parks.map((park) => {
      return buildReservationsForPark(park, arrivalDate, departureDate);
    })
  );
}

function requestParks(parks, size) {
  let startDate = moment().format('YYYY-MM-DD');
  let endDate = moment().add(6, 'months').format('YYYY-MM-DD');

  let batch = parks.splice(0, size || parks.length);
  let batchRequests = batch.map((park) => {
    return buildReservationsForPark(park, startDate, endDate).then((result) => {
      console.log(`Finished ${park.name}`);
      return result;
    });
  });

  return Promise.all(batchRequests).then((results) => {
    if (parks.length > 0) {
      return requestParks(parks, size);
    }
    return results;
  });
}

function scrapePark() {
  return queries.getSingleParkBy({name: 'BRAZOS BEND SP'}).then((park) => {
    return requestParks([ park ]);
  });
}

function scrapeParks() {
  return queries.getAllParks().then((parks) => {
    return requestParks(parks, 5);
  });
}

scrapeParks().then((data) => {
  process.exit();
});

// queries.getCampDatesBy({ date: '2017-02-14' }).limit(10).then((dates) => {
//   console.log('dates = ', dates);
//   process.exit();
// });
