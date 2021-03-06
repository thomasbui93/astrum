import routeSchema from './schema.json';
import TagApi from '../../models/notes/tag';
import {verifyToken} from '../../services/notes/user-service';

export default (app, options, next) => {
  /**
   * Get collection of tags
   */
  app.route({
    method: 'GET',
    url: '/',
    schema: routeSchema.index,
    beforeHandler: verifyToken,
    handler: async (request, reply) => {
      const {page, size, sort, desc, searchKey} = request.query;
      let sortOption = {};

      if (sort) {
        sortOption[sort] = desc ? 1 : -1;
      }

      sortOption.length === 0 ? sortOption = undefined : '';
      try {
        const {
          docs,
          total,
          limit,
          offset
        } = await TagApi.findAll({
          page: page,
          size: size,
          sort: sortOption,
        }, searchKey ? {queryKey: searchKey} : {});

        const currentPage = offset / limit + 1;
        return {
          tags: docs,
          pagination: {
            current: currentPage,
            next: total > currentPage * limit ? currentPage + 1 : 0,
            prev: currentPage > 1 ? currentPage - 1 : 0
          }
        };
      } catch (err) {
        reply.code(400);
        return {error: err.toString()};
      }
    }
  });

  /**
   * Retrieve a tag
   */
  app.route({
    method: 'GET',
    url: '/:key',
    schema: routeSchema.read,
    beforeHandler: verifyToken,
    handler: async (request, reply) => {
      const {key} = request.params;
      try {
        const tag = await TagApi.findOne({key: key});
        if (!tag) {
          reply.code(404);
          return {error: 'No tag is not found'};
        }
        return {tag: tag};
      } catch (err) {
        reply.code(400);
        return {error: err.toString()};
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
        const tag = new TagApi(request.body);
        await tag.save();
        return {tag: tag};
      } catch (err) {
        reply.code(400);
        return {error: err.toString()};
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
      const {key} = request.params;
      try {
        await TagApi.updateOne({key: key}, {$set: request.body});
        return {status: true};
      } catch (err) {
        reply.code(400);
        return {error: err.toString()};
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
      const {key} = request.params;
      try {
        await TagApi.findOneAndRemove({key: key});
        return {status: true};
      } catch (err) {
        reply.code(400);
        return {error: err.toString()};
      }
    }
  });

  /**
   * Remove note
   */
  app.route({
    method: 'DELETE',
    url: '/truncate',
    beforeHandler: verifyToken,
    schema: routeSchema.remove,
    handler: async (request, reply) => {
      try {
        await TagApi.remove();
        return {status: true};
      } catch (err) {
        reply.code(400);
        return {error: err.toString()};
      }
    }
  });

  next();
};
