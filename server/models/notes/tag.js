import mongoose, {Schema} from 'mongoose';
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
  static getDefaultPaginationConfig() {
    return {
      DEFAULT_SIZE: 10,
      DEFAULT_PAGE: 1,
      DEFAULT_SORT: {
        createdAt: -1
      }
    }
  }

  static findAll(options = {}, query = {}) {
    const defaultConfig = this.getDefaultPaginationConfig();
    const {
      page = defaultConfig.DEFAULT_PAGE,
      size = defaultConfig.DEFAULT_SIZE,
      sort = defaultConfig.DEFAULT_SORT
    } = options;

    const offset = page - 1 >= 0 ? size * (page - 1) : 0;

    const {queryKey} = query;
    const scoreData = queryKey ? {score: {$meta: 'textScore'}} : {};
    const pagination = {
      page: page,
      offset: offset,
      limit: size,
      sort: Object.assign({}, sort, scoreData)
    }
    return queryKey ? this.paginate(
      {$text: {$search: queryKey}},
      scoreData,
      pagination
    ) : this.paginate({}, pagination);
  }


  /**
   * Convert tags key to ids
   * @param keys
   * @return {Promise.<*>}
   */
  static async convertKeysToIds(keys) {
    if (!keys) {
      return false;
    }
    keys = keys.split(',').map(key => key.trim());
    try {
      const tags = await this.find({key: {$in: keys}}).select('_id');
      return [... new Set(tags.map(tag => tag._id))];
    } catch (err) {
      return false;
    }
  }
}

schema.loadClass(TagSchema);
schema.plugin(timestamps);
schema.plugin(paginate);
schema.plugin(beautifyUnique);
schema.index({
  'name': 'text',
  'description': 'text'
}, {
  weights: {'name': 5, 'description': 2}
})

schema.pre('save', function (next) {
  this.key = this.key ? this.key : `${this.name.toLowerCase().split(' ').join('-')}-${shortid.generate()}`;
  next();
});

export default mongoose.model('Tag', schema);
