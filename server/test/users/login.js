require("babel-polyfill");

import chai from 'chai';
import chaiHttp from 'chai-http';
import {readConfigPath} from "../../utils/config-reader";
import {clearCollection} from "../../utils/testing/mongo";
import mongoDB from '../../models/mongodb';
import UserApi from '../../models/user/user';

chai.use(chaiHttp);
const testConfig = readConfigPath('test');
const hostURL = testConfig['host'];
const expect = chai.expect;

describe('User Authentication Testing', () => {
  let token = null;

  before(done => {
    mongoDB()
      .then(() => {
        UserApi.remove({})
          .then(function () {
            const user = UserApi({
              username: 'test_user_name',
              email: 'khoa.bui@vaimo.com',
              password: 'test_password',
              firstName: 'Test First Name',
              lastName: 'Test Last Name'
            });
            user.save(function (err, results) {
              if(err){
                console.log(err);
              }
              done();
            })
          })
      })
      .catch(err => {
        console.log(err);
        done();
      });
  });

  it("should able to forbidden user to login with wrong username and password", done => {
    chai.request(hostURL)
      .post('/api/v1/users/authenticate')
      .send({
        username: 'test_user_name',
        password: 'wrong password'
      })
      .end( (err, response) => {
        expect(response).to.have.status(200);
        expect(response.body).to.be.a('object');
        expect(response.body).to.have.property('status').eql(false);
        done();
      })
  });

  it("should able to allow correct user to login with username and password", done => {
    chai.request(hostURL)
      .post('/api/v1/users/authenticate')
      .send({
        username: 'test_user_name',
        password: 'test_password'
      })
      .end( (err, response) => {
        expect(response).to.have.status(200);
        expect(response.body).to.be.a('object');
        expect(response.body).to.have.property('status').eql(true);
        expect(response.body).to.have.property('token').to.be.a('string');
        token = response.body.token;
        done();
      })
  });

  it("should able to update user information", done => {
    chai.request(hostURL)
      .put('/api/v1/users')
      .set('jwt-access-token', token)
      .send({
        email: 'test@vaimo.com',
        firstName: 'Test First Name_1',
        lastName: 'Test Last Name 1'
      })
      .end( (err, response) => {
        expect(response).to.have.status(200);
        expect(response.body).to.be.a('object');
        expect(response.body.user).to.be.a('object');
        expect(response.body.user).to.have.property('email').eql('test@vaimo.com');
        expect(response.body.user).to.have.property('firstName').eql('Test First Name_1');
        expect(response.body.user).to.have.property('lastName').eql('Test Last Name 1');
        done();
      })
  });

  it("should forbid to change password if old password is wrongly provided", done => {
    chai.request(hostURL)
      .post('/api/v1/users/change-password')
      .set('jwt-access-token', token)
      .send({
        oldPassword: 'test_password_asasd',
        password: 'new_password'
      })
      .end( (err, response) => {
        expect(response).to.have.status(400);
        expect(response.body).to.be.a('object');
        expect(response.body).to.have.property('error').to.be.a('string');
        done();
      })
  });

  it("should forbid to change password if old password is not provide", done => {
    chai.request(hostURL)
      .post('/api/v1/users/change-password')
      .set('jwt-access-token', token)
      .send({
        password: 'new_password'
      })
      .end( (err, response) => {
        expect(response).to.have.status(400);
        expect(response.body).to.be.a('object');
        expect(response.body).to.have.property('error').to.be.a('string');
        done();
      })
  });

  it("should forbid to change password if access token is missing", done => {
    chai.request(hostURL)
      .post('/api/v1/users/change-password')
      .send({
        password: 'new_password'
      })
      .end( (err, response) => {
        expect(response).to.have.status(500);
        done();
      })
  });

  it("should able to change password if correct information is provided", done => {
    chai.request(hostURL)
      .post('/api/v1/users/change-password')
      .set('jwt-access-token', token)
      .send({
        oldPassword: 'test_password',
        password: 'new_password'
      })
      .end( (err, response) => {
        expect(response).to.have.status(200);
        expect(response.body).to.be.a('object');
        expect(response.body).to.have.property('token').to.be.a('string');
        expect(response.body.token).to.not.eql(token);
        token = response.body.token;
        done();
      })
  });

  it("should able to authenticate again with new password", done => {
    chai.request(hostURL)
      .post('/api/v1/users/authenticate')
      .set('jwt-access-token', token)
      .send({
        username: 'test_user_name',
        password: 'new_password'
      })
      .end( (err, response) => {
        expect(response).to.have.status(200);
        expect(response.body).to.be.a('object');
        expect(response.body).to.have.property('status').eql(true);
        expect(response.body).to.have.property('token').to.be.a('string');
        token = response.body.token;
        done();
      })
  });

  after(done => {
    clearCollection('users', done);
  });
});