import routeSchema from './schema.json';
import UserApi from '../../models/user/user';
import { verifyToken } from '../../services/notes/user-service';

export default (app, options, next) => {
  /**
   * Authenticate user
   */
  app.route({
    method: 'POST',
    url: '/authenticate',
    schema: routeSchema.login,
    handler: async (request, reply) => {
      try {
        const { username, password } = request.body;
        const token = await UserApi.checkPassword(username, password);
        if (!token) {
          return { status: false };
        }

        return { status: true, token: token };
      } catch (err) {
        reply.code(400);
        return { error: err.toString() };
      }
    }
  });

  /**
   * Create user
   */
  app.route({
    method: 'POST',
    url: '/register',
    schema: routeSchema.register,
    handler: async (request, reply) => {
      try {
        const user = new UserApi(request.body);
        await user.save();
        return { status: true };
      } catch (err) {
        reply.code(400);
        return { error: err.toString() };
      }
    }
  });

  /**
   * Update user information
   */
  app.route({
    method: 'PUT',
    url: '/',
    schema: routeSchema.update,
    beforeHandler: verifyToken,
    handler: async (request, reply) => {
      try {
        const id = request.decoded._id;
        const user = await UserApi.findByIdAndUpdate(id, request.body, { new: true, runValidators: true });
        return { user: user };
      } catch (err) {
        console.log(err);
        reply.code(400);
        return { error: err.toString() };
      }
    }
  });

  /**
   * Change user password
   */
  app.route({
    method: 'POST',
    url: '/change-password',
    schema: routeSchema.changePassword,
    beforeHandler: verifyToken,
    handler: async (request, reply) => {
      try {
        const id = request.decoded._id;
        const { password, oldPassword } = request.body;
        const token = await UserApi.changePassword(id, password, oldPassword);
        if (!token) {
          reply.code(400);
          return { error: 'Authorization is not correct.' };
        }
        return { token: token };
      } catch (err) {
        console.log(err);
        reply.code(400);
        return { error: err.toString() };
      }
    }
  });

  /**
   * Logout current session
   */
  app.route({
    method: 'GET',
    url: '/logout',
    schema: routeSchema.logout,
    beforeHandler: verifyToken,
    handler: async (request, reply) => {
      try {
        await UserApi.logout();
        return { status: true };
      } catch (err) {
        reply.code(400);
        return { error: err.toString() };
      }
    }
  });

  next();
};
