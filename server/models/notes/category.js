import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import paginate from 'mongoose-paginate';
import beautifyUnique from 'mongoose-beautiful-unique-validation';
import shortid from 'shortid';
import { getAvailableCategoryKey } from '../../services/notes/category-service';
import noteApi from './note';

const schema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  path: {
    type: String,
    validate: {
      isAsync: true,
      validator(value, cb) {
        if (!value) {
          return cb(true, '');
        }
        const pathFragments = new Set(value.split('/'));

        getAvailableCategoryKey()
          .then(keys => {
            const availableKeys = keys ? new Set(keys.map(({ key }) => key)) : new Set([]);
            const leftOutFragments = [...pathFragments].filter(
              fragment => !availableKeys.has(fragment)
            );
            leftOutFragments.length > 0 ? cb(false, 'All path fragment should be corrected') : cb(true);
          })
          .catch(error => {
            cb(false, `An unexpected error happened: ${error.toString()}`);
          });
      },
      message: 'Path should be correct'
    }
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

class CategorySchema {
  get url() {
    return this.path ? `${this.path}/${this.key}` : this.key;
  }

  static findAll(options = {}) {
    const { page = 1, size = 10 } = options;
    return this.paginate({}, { page: page, size: size });
  }

  async getCorrespondingNotes() {
    return noteApi.findByCategoryKey(this.key);
  }

  static async convertKeysToIds(keys){
    if(!keys){
      return false;
    }
    keys = keys.split(',').map(key => key.trim());
    try {
      const categories = await this.find({key: { $in: keys}}).select('_id');
      return [... new Set(categories.map(tag => tag._id))];
    } catch (err){
      return false;
    }
  }
}

schema.loadClass(CategorySchema);
schema.plugin(timestamps);
schema.plugin(paginate);
schema.plugin(beautifyUnique);

schema.pre('save', function(next) {
  this.key = this.key ? this.key :
    `${this.name.toLowerCase().split(' ').join('-')}-${shortid.generate()}`;
  next();
});


export default mongoose.model('Category', schema);
