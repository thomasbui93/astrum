import noteRoutes from './notes';
export default (app, options, next) => {
  app.register(noteRoutes, { prefix: '/notes' });
  next();
};
