import mongoose from 'mongoose';
import { getDatabaseConfig } from '../utils/config-reader';

const options = {
  useMongoClient: true
};

const mongoConfig = getDatabaseConfig('mongo');

export default ()=> {
  mongoose.Promise = global.Promise;
  return mongoose.connect(`mongodb://${mongoConfig.host}/${mongoConfig.name}`, options);
};
