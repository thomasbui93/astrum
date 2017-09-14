import routeSchema from './schema.json';
import NoteApi from '../../models/notes/note';

export default (app, options, next) => {
  app.route({
    method: 'GET',
    url: '/',
    schema: routeSchema.index,
    handler: (request, reply) => {
      NoteApi.findAll()
        .then(
          (results) => {
            console.log(results.toJSON());
            reply.send({
              notes: [
                {
                  title: 'string',
                  content: 'string',
                  tags: 'string',
                  category: 'string',
                  key: 'should not appear'
                }
              ]
            });
          }
        );
    }
  });

  app.route({
    method: 'GET',
    url: '/:key',
    schema: routeSchema.read,
    handler: (request, reply) => {
      const { key } = request.params;

      NoteApi.getFull(key)
        .then(() => {
          reply.send({
            note: {
              title: 'string',
              content: 'string',
              tags: 'string',
              category: 'string',
              key: 'should not appear'
            }
          });
        });
    }
  });

  app.route({
    method: 'POST',
    url: '/',
    schema: routeSchema.create,
    handler: (request, reply) => {
      const note = new NoteApi(request.body);
      note.save()
        .then(doc => {
          reply.status(200)
            .send({ note: doc });
        })
        .catch(error => {
          reply.status(400)
            .send({ error: error.toString() });
        });
    }
  });

  app.route({
    method: 'PUT',
    url: '/:key',
    schema: routeSchema.update,
    handler: (request, reply) => {
      const { key } = request.params;
      NoteApi.findOneAndUpdate({ key: key }, request.body)
        .then(note => {
          reply.send({
            note: note
          });
        })
        .catch(error => {
          reply.status(400)
            .send({ error: error.toString() });
        });
    }
  });

  app.route({
    method: 'DELETE',
    url: '/:key',
    schema: routeSchema.remove,
    handler: (request, reply) => {
      const { key } = request.params;
      NoteApi.findOneAndRemove({ key: key })
        .then(() =>{
          reply.send({ status: true });
        })
        .catch(error => {
          reply.status(400)
            .send({ error: error.toString() });
        });
    }
  });

  next();
};

