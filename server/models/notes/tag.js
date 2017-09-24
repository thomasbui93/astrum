import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import paginate from 'mongoose-paginate';
import beautifyUnique from 'mongoose-beautiful-unique-validation';
import shortid from 'shortid';

const schema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  key: {
    type: String,
    unique: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

class TagSchema {
  static findAll(options = {}) {
    const { page = 1, size = 10 } = options;
    return this.paginate({}, { page: page, size: size });
  }

  /**
   * cCnvert tags key to ids
   * @param keys
   * @return {Promise.<*>}
   */
  static async convertKeysToIds(keys){
    if(!keys){
      return false;
    }
    keys = keys.split(',').map(key => key.trim());
    try {
      const tags = await this.find({key: { $in: keys}}).select('_id');
      return [... new Set(tags.map(tag => tag._id))];
    } catch (err){
      return false;
    }
  }
}

schema.loadClass(TagSchema);
schema.plugin(timestamps);
schema.plugin(paginate);
schema.plugin(beautifyUnique);

schema.pre('save', function(next){
  this.key = this.key ? this.key : `${this.name.toLowerCase().split(' ').join('-')}-${shortid.generate()}`;
  next();
});

export default mongoose.model('Tag', schema);
