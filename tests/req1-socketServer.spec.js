const io = require('socket.io-client');

const BASE_URL = 'http://localhost:3000/';

const createCounter = ((repeat, done) => {
  let count = 0;
  return {
    inc() {
      count += 1;
      if (count === repeat) done();
    }
  }
});

describe('1 - Crie um back-end para conexão simultânea de clientes e troca de mensagens em chat público', () => {
  const chatMessage = 'We can only see a short distance ahead, but we can see plenty there that needs to be done.';
  const nickname = 'Alan Turing';

  let clients;

  afterEach(async (done) => {
    const counter = createCounter(clients.length, done);
    clients.forEach((client) => {
      client.on('disconnect', counter.inc);
      client.disconnect();
    })
  });

  it('Será validado que todos os clientes que estão conectados ao chat recebem as mensagens enviadas', async (done) => {
    const NUMBER_OF_CLIENTS = 3

    clients = Array.from({ length: NUMBER_OF_CLIENTS }, () =>
      io.connect(BASE_URL, { reconnection: false }));

    expect.assertions(NUMBER_OF_CLIENTS);

    const counter = createCounter(NUMBER_OF_CLIENTS, done);

    clients.forEach((client) => {
      client.on('message', (message) => {
        expect(message.includes(chatMessage)).toBeTruthy();
        counter.inc();
      });
    })

    const [client] = clients;

    client.emit('message', { chatMessage, nickname });
  });

  it('Será validado que toda mensagem que um cliente recebe contém as informações acerca de quem a enviou, data-hora do envio e o conteúdo da mensagem em si', async (done) => {
    const NUMBER_OF_CLIENTS = 2

    const dateRegex = /\d{1,2}-\d{1,2}-\d{4}/gm;
    const timeRegex = /\d{1,2}:\d{1,2}(:\d{0,2})?/gm;

    clients = Array.from({ length: NUMBER_OF_CLIENTS }, () =>
      io.connect(BASE_URL, { reconnection: false }));

    const counter = createCounter(NUMBER_OF_CLIENTS, done);

    clients.forEach((client) => client.on('message', (message) => {
      expect(message.includes(chatMessage)).toBeTruthy();
      expect(message.includes(nickname)).toBeTruthy();
      expect(message).toMatch(dateRegex);
      expect(message).toMatch(timeRegex);
      counter.inc();
    }));

    const [client] = clients;

    client.emit('message', { chatMessage, nickname });
  });
});
