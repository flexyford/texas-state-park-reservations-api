var moment = require('moment');

const PARKS = {
  /* "PARK NAME": CAMP_ID */
  "ABILENE SP": 219,
  "ATLANTA SP": 110,
  "BALMORHEA SP": 164,
  "BARTON WARNOCK VISITOR CENTER": null,
  "BASTROP SP": 180,
  "BATTLESHIP TEXAS SHS": null,
  "BENTSEN RIO GRANDE SP": null,
  "BIG BEND RANCH SP": null,
  "BIG SPRING SP": null,
  "BLANCO SP": 1,
  "BONHAM SP": 4,
  "BRAZOS BEND SP": 50,
  "BUESCHER SP": "31,6851",
  "CADDO LAKE SP": 19,
  "CAPROCK CANYONS SP": 217,
  "CEDAR HILL SP": 112,
  "CHOKE CANYON SP": 13,
  "CLEBURNE SP": 145,
  "COLORADO BEND SP": 169,
  "COOPER LAKE SP DOCTORS CREEK": 39,
  "COOPER LAKE SP SOUTH SULPHUR": 36,
  "COPPER BREAKS SP": 67,
  "DAINGERFIELD SP": 12,
  "DAVIS MOUNTAINS SP": 90,
  "DEVILS RIVER SNA": null,
  "DEVILS SINKHOLE SNA": null,
  "DINOSAUR VALLEY SP": 13,
  "EISENHOWER SP": 61,
  "ENCHANTED ROCK SNA": 79,
  "ESTERO LLANO GRANDE SP": null,
  "FAIRFIELD LAKE SP": 185,
  "FALCON SP": 187,
  "FANTHORP INN SHS": null,
  "FORT BOGGY SP": null,
  "FORT LEATON SHS": null,
  "FORT PARKER SP": 56,
  "FORT RICHARDSON SP AND SHS": 160,
  "FRANKLIN MOUNTAINS SP": null,
  "GALVESTON ISLAND SP": 5703,
  "GARNER SP": 156,
  "GOLIAD SP": 22,
  "GOOSE ISLAND SP": 190,
  "GOVERNMENT CANYON SNA": 99,
  "GUADALUPE RIVER SP": 7,
  "HILL COUNTRY SNA": 88,
  "HUECO TANKS SP AND SHS": null,
  "HUNTSVILLE SP": 117,
  "INDIAN LODGE": null,
  "INKS LAKE SP": 102,
  "KICKAPOO CAVERN SP": 5810,
  "LK ARROWHEAD SP": 75,
  "LK BOB SANDLIN SP": 223,
  "LK BROWNWOOD SP": 194,
  "LK CASA BLANCA INTERNATIONAL SP": 29,
  "LK COLORADO CITY SP": 114,
  "LK CORPUS CHRISTI SP": 47,
  "LK LIVINGSTON SP": "136,6651",
  "LK MINERAL WELLS SP": 85,
  "LK SOMERVILLE SP BIRCH CREEK": 172,
  "LK SOMERVILLE SP NAILS CREEK": null,
  "LK TAWAKONI SP": 167,
  "LK WHITNEY SP": 42,
  "LOCKHART SP": 9,
  "LOST MAPLES SNA": 95,
  "LYNDON B. JOHNSON SP AND SHS": null,
  "MARTIN CREEK LAKE SP": 129,
  "MARTIN DIES JR. SP": 132,
  "MCKINNEY FALLS SP": 25,
  "MERIDIAN SP": 203,
  "MISSION TEJAS SP": 210,
  "MONAHANS SANDHILLS SP": 226,
  "MONUMENT HILL/KREISCHE BREWERY": null,
  "MOTHER NEFF SP": 120,
  "MUSTANG ISLAND SP": 153,
  "PALMETTO SP": 174,
  "PALO DURO CANYON SP": 208,
  "PEDERNALES FALLS SP": 77,
  "POSSUM KINGDOM SP": 82,
  "PURTIS CREEK SP": 54,
  "RAY ROBERTS LK SP ISLE DU BOIS": 96,
  "RAY ROBERTS LK SP JOHNSON BRANCH": 83,
  "RESACA DE LA PALMA SP": null,
  "SAN ANGELO SP": 141,
  "SAN JACINTO BATTLEGROUND SHS": null,
  "SEA RIM SP": 5971,
  "SEMINOLE CANYON SP AND SHS": 163,
  "SHELDON LAKE SP": null,
  "SOUTH LLANO RIVER SP": 171,
  "STEPHEN F. AUSTIN SP": 198,
  "TYLER SP": 70,
  "VILLAGE CREEK SP": 214,
  "WASHINGTON ON THE BRAZOS SHS": null,
  "WYLER AERIAL TRAMWAY": null
};

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
      return Promise.all([
        knex('sites').insert({
          type: "WATER ONLY CAMPSITE",
          pet: true,
          electric: false,
          water: true,
          sewer: false,
          park_id: park.id
        }),
        knex('sites').insert({
          type: "PRIMITIVE HIKE-IN",
          pet: true,
          electric: false,
          water: false,
          sewer: false,
          park_id: park.id
        }),
        knex('sites').insert({
          type: "OVERFLOW SITES",
          pet: true,
          electric: false,
          water: false,
          sewer: false,
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
      let now = moment();
      let days = [1,2,3,4,5,6,7];

      let campDates = sites.reduce((campDates, site, index) => {
        let dates = days.map((day) => {
          let available = (days.length * index) + day;
          return knex('camp_dates').insert({
            date: now.add(day, 'day').format(),
            available,
            site_id: site.id
          });
        });

        return campDates.concat(dates);
      }, []);

      return Promise.all(campDates);
    });
};
