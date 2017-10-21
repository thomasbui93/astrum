import mongoose from 'mongoose';
import { getDatabaseConfig } from '../utils/config-reader';

const options = {
  useMongoClient: true,
  server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
  replset: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }
};

const mongoConfig = getDatabaseConfig('mongo');
console.log(mongoConfig);
const {username, password, host, port, name} = mongoConfig;
export default ()=> {
  mongoose.Promise = global.Promise;
  return mongoose.connect(`mongodb://${username}:${password}@${host}:${port}/${name}`, options);
};
