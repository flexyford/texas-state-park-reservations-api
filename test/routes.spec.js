process.env.NODE_ENV = 'test';

let chai = require('chai');
let expect = chai.expect;
let chaiHttp = require('chai-http');
let server = require('../app');
let knex = require('../db/knex');

chai.use(chaiHttp);

describe('API Routes', function() {

  beforeEach(function(done) {
    knex.migrate.rollback()
      .then(() => knex.migrate.latest())
      .then(() => knex.seed.run())
      .then(() => done());
  });

  afterEach(function(done) {
    knex.migrate.rollback()
      .then(() => done());
  });

  describe('GET /api/v1/parks', function() {
    let response;

    beforeEach(function(done) {
      chai.request(server)
        .get('/api/v1/parks')
        .end(function(err, res) {
          response = res;
          done();
        });
    });

    it('should return all parks', function() {
      expect(response).to.have.status(200);
      expect(response).to.be.json; // jshint ignore:line

      expect(response.body).to.be.a('object');
      expect(response.body).to.have.property('parks');

      let parks = response.body.parks;
      expect(parks.length).to.equal(93);

      let park = parks.find((p) => p.name === 'ENCHANTED ROCK SNA');

      expect(park).to.exist;
      expect(park).to.have.property('name');
      expect(park).to.have.property('reserveworld_camp_ids');
      expect(park).to.have.property('created_at');
      expect(park).to.have.property('updated_at');
      expect(park).to.have.property('sites');

      expect(park.sites).to.be.a('array');
      expect(park.sites.length).to.equal(3);
      expect(park.sites).to.deep.equal([1,2,3]);
    });
  });

  describe('GET /api/v1/parks/:id', function() {
    let response;

    beforeEach(function(done) {
      chai.request(server)
        .get('/api/v1/parks/1')
        .end(function(err, res) {
          response = res;
          done();
        });
    });

    it('should return a single park', function() {
      expect(response).to.have.status(200);
      expect(response).to.be.json; // jshint ignore:line

      expect(response.body).to.be.a('object');
      expect(response.body).to.have.property('park');

      let park = response.body.park;
      expect(park).to.have.property('name');
      expect(park).to.have.property('reserveworld_camp_ids');
      expect(park).to.have.property('created_at');
      expect(park).to.have.property('updated_at');

      expect(park).to.have.property('sites');
      expect(park).to.not.have.property('site_ids');

      expect(park.sites).to.be.a('array');
    });
  });

  describe('GET /api/v1/sites', function() {
    let response;

    beforeEach(function(done) {
      chai.request(server)
        .get('/api/v1/sites')
        .end(function(err, res) {
          response = res;
          done();
        });
    });

    it('should return all sites', function() {
      expect(response).to.have.status(200);
      expect(response).to.be.json; // jshint ignore:line

      expect(response.body).to.be.a('object');
      expect(response.body).to.have.property('sites');

      let sites = response.body.sites;
      expect(sites.length).to.equal(3);

      let site = sites[0];
      expect(site).to.exist;
      expect(site).to.have.property('type');
      expect(site).to.have.property('pet');
      expect(site).to.have.property('electric');
      expect(site).to.have.property('water');
      expect(site).to.have.property('sewer');
      expect(site).to.have.property('created_at');
      expect(site).to.have.property('updated_at');

      expect(site).to.have.property('park');
      expect(site).to.not.have.property('park_id');

      expect(site).to.have.property('camp_dates');
      expect(site).to.not.have.property('camp_date_ids');

      expect(site.camp_dates).to.be.a('array');
      expect(site.camp_dates.length).to.equal(7);
    });
  });

  describe('GET /api/v1/sites/:id', function() {
    let response;

    beforeEach(function(done) {
      chai.request(server)
        .get('/api/v1/sites/1')
        .end(function(err, res) {
          response = res;
          done();
        });
    });

    it('should return a single park', function() {
      expect(response).to.have.status(200);
      expect(response).to.be.json; // jshint ignore:line

      expect(response.body).to.be.a('object');
      expect(response.body).to.have.property('site');

      let site = response.body.site;

      expect(site).to.exist;
      expect(site).to.have.property('type');
      expect(site).to.have.property('pet');
      expect(site).to.have.property('electric');
      expect(site).to.have.property('water');
      expect(site).to.have.property('sewer');
      expect(site).to.have.property('created_at');
      expect(site).to.have.property('updated_at');

      expect(site).to.have.property('park');
      expect(site).to.not.have.property('park_id');

      expect(site).to.have.property('camp_dates');
      expect(site).to.not.have.property('camp_date_ids');

      expect(site.camp_dates).to.be.a('array');
      expect(site.camp_dates.length).to.equal(7);
    });
  });

  describe('GET /api/v1/camp_dates/:id', function() {
    let response;

    beforeEach(function(done) {
      chai.request(server)
        .get('/api/v1/camp_dates/1')
        .end(function(err, res) {
          response = res;
          done();
        });
    });

    it('should return a single camp_date', function() {
      expect(response).to.have.status(200);
      expect(response).to.be.json; // jshint ignore:line

      expect(response.body).to.be.a('object');
      expect(response.body).to.have.property('camp_date');

      let camp_date = response.body.camp_date;

      expect(camp_date).to.exist;
      expect(camp_date).to.have.property('date');
      expect(camp_date).to.have.property('available');
      expect(camp_date).to.have.property('created_at');
      expect(camp_date).to.have.property('updated_at');

      expect(camp_date).to.have.property('site');
      expect(camp_date).to.not.have.property('site_id');
    });
  });
});
