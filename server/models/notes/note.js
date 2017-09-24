import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import paginate from 'mongoose-paginate';
import beautifyUnique from 'mongoose-beautiful-unique-validation';
import shortid from 'shortid';

const schema = new Schema({
  title: {
    type: String,
    index: true,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  tags: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Tag'
    }
  ],
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  key: {
    type: String,
    unique: 'This field should be ({VALUE})'
  }
});

class NoteSchema {
  /**
   * Get notes by category key
   * @param key
   * @param options
   * @return {Query|Promise|Document|*}
   */
  static findByCategoryKey(key, options = {}) {
    const { page = 1, limit = 5 } = options;
    return this.paginate({ 'category.key': key },
      {
        page: page,
        limit: limit,
        sort: { createdAt: -1 },
        populate: [
          {
            path: 'category',
            match: {
              isActive: true
            },
            options: {
              limit: 5
            }
          },
          {
            path: 'tags',
            match: {
              isActive: true
            },
            options: {
              limit: 5
            }
          }
        ]
      });
  }

  /**
   * Get A populated note
   * @param key
   * @return {Query|Promise|Document|*}
   */
  static getFull(key) {
    return this.findOne({ key: key })
      .populate('category', 'tags');
  }

  /**
   * Get A list of notes
   * @param options
   * @return {Query|Promise|Document|*}
   */
  static findAll(options = {}) {
    console.log(options);
    const { page = 1, limit = 5 } = options;
    return this.paginate({}, {
      page: page,
      limit: limit ,
      sort: { createdAt: -1 },
      populate: [
        {
          path: 'category',
          match: {
            isActive: true
          },
          options: {
            limit: 5
          }
        },
        {
          path: 'tags',
          match: {
            isActive: true
          },
          options: {
            limit: 5
          }
        }
      ]
    });
  }
}

schema.loadClass(NoteSchema);
schema.plugin(timestamps);
schema.plugin(paginate);
schema.plugin(beautifyUnique);
schema.index({title: 'text', content: 'text'}, {"weights": { title: 2, content:1 }});

schema.pre('save', function (next) {
  this.key = this.key ? this.key : `${this.title.toLowerCase().split(' ').join('-')}-${shortid.generate()}`;
  next();
});

export default mongoose.model('Note', schema);
