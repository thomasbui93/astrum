import mongoose from 'mongoose';
import mongoDB from '../../models/mongodb';

export const clearCollection = (collectionName, cb) => {
  mongoDB()
    .then(() => {
      mongoose.connection.db.dropCollection(collectionName, () => {
        cb();
      });
    })
    .catch(err => {
      console.log(err);
      cb();
    });
};