const express = require('express');
const bodyParser = require('body-parser');
const router = require('./routes/router');
const errorMiddleware = require('./middlewares/ErrorMiddleware');

const app = express();
const DEFAULT_PORT = 3000;
const PORT = process.env.PORT || DEFAULT_PORT;


app.use(bodyParser.json());
app.use(router);
app.use(errorMiddleware);

app.listen(PORT, () => console.log(`Connected at port ${PORT}`));

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.send();
});
