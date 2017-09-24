import UserApi from '../../models/user/user';
import jwt from 'jsonwebtoken';
import { readConfigPath } from '../../utils/config-reader';

export const userCount = () => {
  return UserApi.find({}).count();
};

export const verifyToken = (request, reply, done) => {
  const JWToken = request.body.token || request.query.token || request.req.headers['jwt-access-token'];
  const JWTSecret = readConfigPath('credential.token');

  if (!JWToken || !JWTSecret) {
    return done(new Error('Authorization Token is missing.'));
  }

  UserApi.findOne({})
    .then(user => {
      console.log(user.token, JWToken);
      if (user.token !== JWToken) {
        return done(new Error('Invalid access token'));
      }

      jwt.verify(JWToken, JWTSecret, function (err, decoded) {
        if (err) {
          return done(new Error('Invalid access token.'));
        }
        request.decoded = decoded;
        done();
      });
    })
    .catch(err => {
      console.log(err);
      return done(new Error(`Unexpected error ${err.toString()}`));
    });
};
