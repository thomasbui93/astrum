import routeSchema from './schema.json';
import NoteApi from '../../models/notes/note';
import TagApi from '../../models/notes/tag';
import CategoryApi from '../../models/notes/category';

export default (app, options, next) => {
  /**
   * Get collection of notes
   */
  app.route({
    method: 'GET',
    url: '/',
    schema: routeSchema.index,
    handler: async (request, reply) => {
      const { page = 1} = request.query;
      try {
        const { docs } = await NoteApi.findAll({page: page});
        return { notes: docs };
      } catch (err) {
        reply.code(400);
        return { error: err.toString() };
      }
    }
  });

  /**
   * Retrieve a note
   */
  app.route({
    method: 'GET',
    url: '/:key',
    schema: routeSchema.read,
    handler: async (request, reply) => {
      const { key } = request.params;
      try {
        const note = await NoteApi.getFull(key);
        return { note: note };
      } catch (err) {
        reply.code(400);
        return { error: err.toString() };
      }
    }
  });

  /**
   * Create Note
   */
  app.route({
    method: 'POST',
    url: '/',
    schema: routeSchema.create,
    handler: async (request, reply) => {
      try {
        let rawData = request.body;
        rawData.tags = await TagApi.convertKeysToIds(rawData.tags);
        rawData.category = await CategoryApi.convertKeysToIds(rawData.category);
        const note = new NoteApi(rawData);
        await note.save();
        return { status: true };
      } catch (err) {
        reply.code(400);
        return { error: err.toString() };
      }
    }
  });

  /**
   * Update note
   */
  app.route({
    method: 'PUT',
    url: '/:key',
    schema: routeSchema.update,
    handler: async (request, reply) => {
      const { key } = request.params;
      try {
        await NoteApi.updateOne({ key: key }, { $set: request.body });
        return { status: true };
      } catch (err) {
        reply.code(400);
        return { error: err.toString() };
      }
    }
  });

  /**
   * Remove note
   */
  app.route({
    method: 'DELETE',
    url: '/:key',
    schema: routeSchema.remove,
    handler: async (request, reply) => {
      const { key } = request.params;
      try {
        await NoteApi.findOneAndRemove({ key: key });
        return { status: true };
      } catch (err) {
        reply.code(400);
        return { error: err.toString() };
      }
    }
  });

  next();
};

