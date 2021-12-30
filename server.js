const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: 'http://localhost:3000/',
    methods: ['GET', 'POST'],
} });

const PORT = 3000;

app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.static(`${__dirname}/public`));

require('./sockets/chat')(io);

app.get('/', async (_req, res) => {
  res.status(200).render('index');
});

http.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
