import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import paginate from 'mongoose-paginate';
import beautifyUnique from 'mongoose-beautiful-unique-validation';

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
  static findByCategoryKey(key, options) {
    const { page = 1, size = 10 } = options;
    return this.paginate({ 'category.key': key }, { page: page, size: size });
  }

  /**
   * Get A populated note
   * @param key
   * @return {Query|Promise|Document|*}
   */
  static getFull(key) {
    return this.findOne({ key: key })
      .populate('category', 'tag');
  }


  static findAll(key, options) {
    const { page = 1, size = 10 } = options;
    return this.paginate({}, { page: page, size: size });
  }
}


schema.loadClass(NoteSchema);
schema.plugin(timestamps);
schema.plugin(paginate);
schema.plugin(beautifyUnique);

export default mongoose.model('Note', schema);
