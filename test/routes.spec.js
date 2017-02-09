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

      let park = parks[0];
      expect(park).to.have.property('name');
      expect(park).to.have.property('reserveworld_camp_ids');
      expect(park).to.have.property('created_at');
      expect(park).to.have.property('updated_at');
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
    });
  });
});
