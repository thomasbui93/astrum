import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';

const Category = new Schema({
  name: {
    type: String
  },
  description: {
    type: String
  },
  path: {
    type: String
  },
  key: {
    type: String
  }
});

Category.plugin(timestamps);

export default mongoose.model('Category', Category);
