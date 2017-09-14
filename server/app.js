'use strict';
import fastify from "fastify";
import connectDatabase from "./models/mongodb";
import routeApi from "./routes/index";

connectDatabase()
  .then(result => {
    console.log('Connected to database');
  });

const app = fastify();
app.register(routeApi, {prefix: "/api/v1"});
app.listen(3000);