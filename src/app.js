const bodyParser = require('body-parser');
const express = require('express');

const router = require('./router');
const middlewares = require('./middlewares');

const app = express();

app.use(bodyParser.json());
app.use(router);

app.use(middlewares.error);

module.exports = app;
