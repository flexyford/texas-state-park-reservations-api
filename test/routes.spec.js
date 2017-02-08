process.env.NODE_ENV = 'test';

var chai = require('chai');
var expect = chai.expect;
var chaiHttp = require('chai-http');
var server = require('../app');

chai.use(chaiHttp);

describe('API Routes', function() {

  describe('GET /api/v1/parks', function() {
    let error, response;

    beforeEach(function(done) {
      chai.request(server)
        .get('/api/v1/parks')
        .end(function(err, res) {
          response = res;
          error = err;
          done();
        });
    });

    it('should return all parks', function() {
      console.log("response = ", response);
      expect(response).to.have.status(200);
      expect(response).to.be.json; // jshint ignore:line
      expect(response.body).to.be.a('array');
      expect(response.body.length).to.equal(93);

      let park = response.body[0];
      expect(park).to.have.property('name');
      expect(park).to.have.property('reserveworld_camp_ids');
      expect(park).to.have.property('created_at');
      expect(park).to.have.property('updated_at');
    });
  });
});
