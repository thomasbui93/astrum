import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';

const Tag = new Schema({
  name: {
    type: String
  },
  description: {
    type: String
  },
  key: {
    type: String,
    unique: true
  }
});

Tag.plugin(timestamps);

export default mongoose.model('Tag', Tag);
