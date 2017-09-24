require("babel-polyfill");
require("babel-register");

import chai from 'chai';
import chaiHttp from 'chai-http';
import {readConfigPath} from "../../utils/config-reader";
import {clearCollection} from "../../utils/testing/mongo"

chai.use(chaiHttp);
const testConfig = readConfigPath('test');
const hostURL = testConfig['host'];
const expect = chai.expect;

describe('User Registration Testing', () => {

  before(done => {
    clearCollection('users', done);
  });

  it('should throw error if the input information is not correct: failed user name input', function (done) {
      chai.request(hostURL)
        .post('/api/v1/users/register')
        .send({
          username: 'test user name',
          email: 'khoa.bui@vaimo.com',
          password: 'test_password',
          firstName: 'Test First Name',
          lastName: 'Test Last Name'
        })
        .end( (err, response) => {
          expect(response).to.have.status(400);
          done();
        })
  });

  it('should throw error if the input information is not correct: failed user email input', function (done) {
    chai.request(hostURL)
      .post('/api/v1/users/register')
      .send({
        username: 'test_user_name',
        email: 'khoa.bui.vaimo.com',
        password: 'test_password',
        firstName: 'Test First Name',
        lastName: 'Test Last Name'
      })
      .end( (err, response) => {
        expect(response).to.have.status(400);
        done();
      })
  });


  it('should throw error if the input information is not correct: Missing password field', function (done) {
    chai.request(hostURL)
      .post('/api/v1/users/register')
      .send({
        username: 'test_user_name',
        email: 'khoa.bui.vaimo.com',
        firstName: 'Test First Name',
        lastName: 'Test Last Name'
      })
      .end( (err, response) => {
        expect(response).to.have.status(400);
        done();
      })
  });

  it('should create user if the input information is correct', function (done) {
    chai.request(hostURL)
      .post('/api/v1/users/register')
      .send({
        username: 'test_user_name',
        email: 'khoa.bui@vaimo.com',
        password: 'test_password',
        firstName: 'Test First Name',
        lastName: 'Test Last Name'
      })
      .end( (err, response) => {
        expect(response).to.have.status(200);
        expect(response.body).to.be.a('object');
        expect(response.body).to.have.property('status').eql(true);
        done();
      })
  });

  it('should not create another user, even if the information is correct', function (done) {
    chai.request(hostURL)
      .post('/api/v1/users/register')
      .send({
        username: 'test_user_name_1',
        email: 'khoa.bui@vaimo.com_1',
        password: 'test_password_1',
        firstName: 'Test First Name_1',
        lastName: 'Test Last Name 1'
      })
      .end( (err, response) => {
        expect(response).to.have.status(400);
        done();
      })
  });

  after(done => {
    clearCollection('users', done);
  });
});
