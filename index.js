const express = require('express');
const rescue = require('express-rescue');
const bodyParser = require('body-parser');
const { data, auth } = require('./middlewares');

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

app.get('/talker', data.getAll);
app.get('/talker/search', auth.authenticateUser, rescue(data.search));
app.get('/talker/:id', rescue(data.getById));
app.post('/login', auth.login);
app.post('/talker', auth.authenticateUser, data.validateData, rescue(data.create));
app.put('/talker/:id', auth.authenticateUser, data.validateData, rescue(data.update));
app.delete('/talker/:id', auth.authenticateUser, rescue(data.remove));

app.use((err, _req, res, _next) => {
  const { status, message } = err;
  res.status(status).json({ message });
});

app.use((err, _req, res, _next) => {
  const { message } = err;
  res.status(500).json({ message });
});

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.listen(PORT, () => {
  console.log('Online');
});
