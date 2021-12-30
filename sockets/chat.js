const getDatetimeStr = require('../utils/getDatetimeStr');
const formatMessage = require('../utils/formatMessage');
const Message = require('../models');

const START_EVENT = 'start';
const MESSAGE_EVENT = 'message';
const SET_NICKNAME_EVENT = 'setNickname';
const ONLINE_USERS_EVENT = 'onlineUsers';
const CONNECTION_EVENT = 'connection';
const DISCONNECT_EVENT = 'disconnect';

const createClient = ({ io, socket }) => ({
  nickname: socket.id.toString().slice(0, 16),
  updateNickname(newNickname) { this.nickname = newNickname; },
  sendToThisClient(event, content) { socket.emit(event, content); },
  sendToAllClients(event, content) { io.emit(event, content); },
  sendToOtherClients(event, content) { socket.broadcast.emit(event, content); },
});

const users = {
  list: [],
  addUser(userNickname) { this.list.push(userNickname); },
  updateUserNickname(currentNick, newNick) {
    this.list = this.list.map((user) => ((user === currentNick) ? newNick : user));
  },
  removeUser(userNickname) { this.list = this.list.filter((user) => user !== userNickname); },
};

const updateClientNickname = (client, usersObj) => (newNickname) => {
  const message = `${client.nickname} mudou seu nick para ${newNickname}`;
  client.sendToAllClients(MESSAGE_EVENT, message);
  usersObj.updateUserNickname(client.nickname, newNickname);
  client.updateNickname(newNickname);
  client.sendToAllClients(ONLINE_USERS_EVENT, usersObj.list);
};

const sendClientMessage = (client) => async ({ nickname, chatMessage: message }) => {
  const timestamp = getDatetimeStr();
  const messageObj = { message, nickname, timestamp };
  await Message.create(messageObj);
  const messageStr = formatMessage(messageObj);
  client.sendToAllClients(MESSAGE_EVENT, messageStr);
};

const disconnectClient = (client) => () => {
  const message = `${client.nickname} deixou a sala`;
  client.sendToOtherClients(MESSAGE_EVENT, message);
  users.removeUser(client.nickname);
  client.sendToAllClients(ONLINE_USERS_EVENT, users.list);
};

const startChatClient = (io) => async (socket) => {
  const dbMessages = await Message.getAll();
  const messageHistory = dbMessages.map((messageObj) => formatMessage(messageObj));
  const client = createClient({ io, socket });
  users.addUser(client.nickname);
  client.sendToThisClient(START_EVENT, { nickname: client.nickname, messageHistory });
  client.sendToAllClients(ONLINE_USERS_EVENT, users.list);
  socket.on(SET_NICKNAME_EVENT, updateClientNickname(client, users));
  socket.on(MESSAGE_EVENT, sendClientMessage(client));
  socket.on(DISCONNECT_EVENT, disconnectClient(client));
};

module.exports = (io) => io.on(CONNECTION_EVENT, startChatClient(io));
