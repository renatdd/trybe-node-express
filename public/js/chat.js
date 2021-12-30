const socket = window.io();

const START_EVENT = 'start';
const MESSAGE_EVENT = 'message';
const SET_NICKNAME_EVENT = 'setNickname';
const ONLINE_USERS_EVENT = 'onlineUsers';

const messageForm = document.querySelector('#messageForm');
const inputMessage = document.querySelector('#messageInput');
const nicknameForm = document.querySelector('#nicknameForm');
const inputNickname = document.querySelector('#nicknameInput');
const onlineUsersList = document.querySelector('#onlineUsers');

let clientNickname;
let clientNicknameLi;

const createUserElement = (nickname, userClass) => {
  const li = document.createElement('li');
  li.innerText = nickname;
  li.classList.toggle(userClass);
  li.dataset.testid = 'online-user';
  onlineUsersList.appendChild(li);
  return li;
};

const renderClientNickname = (givenNickname) => {
  const hasNicknameChanged = clientNickname && givenNickname !== clientNickname;
  const element = hasNicknameChanged
    ? clientNicknameLi
    : createUserElement(givenNickname, 'me');
  clientNickname = givenNickname;
  clientNicknameLi = element;
  element.innerText = clientNickname;
};

const createMessage = (message) => {
  const messagesUl = document.querySelector('#messages');
  const li = document.createElement('li');
  li.innerText = message;
  li.dataset.testid = 'message';
  messagesUl.appendChild(li);
};

const renderOnlineUsers = (users) => {
  const otherUsers = users.filter((user) => user !== clientNickname);
  const rendered = document.querySelectorAll('.others');
  rendered.forEach((el) => el.remove());
  otherUsers.forEach((user) => createUserElement(user, 'others'));
};

socket.on(START_EVENT, ({ nickname, messageHistory }) => {
  messageHistory.forEach((message) => createMessage(message));
  renderClientNickname(nickname);
});
socket.on(MESSAGE_EVENT, (message) => createMessage(message));
socket.on(ONLINE_USERS_EVENT, (onlineUsers) => renderOnlineUsers(onlineUsers));

messageForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const chatMessage = inputMessage.value;
  socket.emit(MESSAGE_EVENT, { nickname: clientNickname, chatMessage });
  inputMessage.value = '';
});

nicknameForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const newNickname = inputNickname.value;
  socket.emit(SET_NICKNAME_EVENT, newNickname);
  renderClientNickname(newNickname);
  inputNickname.value = '';
});

// window.onbeforeunload = () => socket.disconnect();
