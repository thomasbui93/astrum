import routeSchema from './schema.json';
import CategoryApi from '../../models/notes/category';
import { verifyToken } from '../../services/notes/user-service';
export default (app, options, next) => {
  /**
   * Get collection of categories
   */
  app.route({
    method: 'GET',
    url: '/',
    schema: routeSchema.index,
    beforeHandler: verifyToken,
    handler: async (request, reply) => {
      try {
        const { docs } = await CategoryApi.findAll();
        return { categories: docs };
      } catch (err) {
        reply.code(400);
        return { error: err.toString() };
      }
    }
  });

  /**
   * Retrieve a category
   */
  app.route({
    method: 'GET',
    url: '/:key',
    schema: routeSchema.read,
    beforeHandler: verifyToken,
    handler: async (request, reply) => {
      const { key } = request.params;
      try {
        const category = await CategoryApi.findOne({ key: key });
        if (!category) {
          reply.code(404);
          return { error: 'No category is not found' };
        }
        const { docs } = await category.getCorrespondingNotes();
        return { category: category, notes: docs };
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
    beforeHandler: verifyToken,
    handler: async (request, reply) => {
      try {
        const category = new CategoryApi(request.body);
        await category.save();
        return { category: category };
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
    beforeHandler: verifyToken,
    handler: async (request, reply) => {
      const { key } = request.params;
      try {
        await CategoryApi.updateOne({ key: key }, { $set: request.body });
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
    beforeHandler: verifyToken,
    handler: async (request, reply) => {
      const { key } = request.params;
      try {
        await CategoryApi.findOneAndRemove({ key: key });
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
    url: '/truncate',
    schema: routeSchema.remove,
    beforeHandler: verifyToken,
    handler: async (request, reply) => {
      try {
        await CategoryApi.remove();
        return { status: true };
      } catch (err) {
        reply.code(400);
        return { error: err.toString() };
      }
    }
  });

  next();
};

