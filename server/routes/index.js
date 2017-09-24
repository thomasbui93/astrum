import noteRoutes from './notes';
import categoryRoutes from './category';
import tagRoutes from './tag';
import userRoutes from './authentication';

export default (app, options, next) => {
  app.register(noteRoutes, { prefix: '/notes' });
  app.register(categoryRoutes, { prefix: '/categories' });
  app.register(tagRoutes, { prefix: '/tags' });
  app.register(userRoutes, { prefix: '/users' });

  next();
};
