'use strict';
import fastify from "fastify";
import connectDatabase from "./models/mongodb";
import routeApi from "./routes/index";

connectDatabase()
  .then(result => {
    console.log('Connected to database');
  })
  .catch(err => {
    console.log(err);
  });

const app = fastify();
app.register(require('fastify-formbody'), {}, (err) => {
  if (err) throw err
});
app.register(routeApi, {prefix: "/api/v1"});
app.listen(3000);

export default app;