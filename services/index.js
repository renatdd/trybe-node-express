const fs = require('fs');
const errors = require('../errors');

const TALKERS_DATA_FILEPATH = './talker.json';
const USER_DATA_FILEPATH = './user-data.json';

const getToken = () => {
  const minCharCode = 48;
  const maxCharCode = 122;
  const codesArray = Array.from({ length: 16 }, () => (
    Math.floor(Math.random() * (maxCharCode - minCharCode + 1) + minCharCode)
  ));
  return codesArray.map((code) => String.fromCharCode(code)).join('');
};

const validateEmail = (email) => email.match(/\w+@\w+\.[a-z]{2,3}/);

const validatePassword = (password) => password.length >= 6;

const writeFile = (file, data) => {
  const dataToString = JSON.stringify(data, null, 4);
  fs.promises.writeFile(file, dataToString);
};

const storeUserData = (userData) => {
  writeFile(USER_DATA_FILEPATH, userData);
};

const storeTalkerData = (data) => {
  writeFile(TALKERS_DATA_FILEPATH, data);
};

const getUserData = async () => {
  const content = await fs.promises.readFile(USER_DATA_FILEPATH);
  return JSON.parse(content);
};

const validateTalkerName = (name) => name.length >= 3;
const validateTalkerAge = (age) => Number(age) >= 18;
const validateTalkerWatchedAt = (watchedAt) => watchedAt.match(/\d{2}\/\d{2}\/\d{4}/);
const validateTalkerRate = (rate) => rate >= 1 && rate <= 5;

const validateTalkerNameAndAge = ({ name, age, next }) => {
  switch (true) {
    case !name:
      return next(errors.nameMissing);
    case !validateTalkerName(name):
      return next(errors.nameInvalid);
    case !age:
      return next(errors.ageMissing);
    case !validateTalkerAge(age):
      return next(errors.ageInvalid);
    default:
      break;
  }
};

const hasMissingTalkData = (talk) => !talk || !talk.watchedAt || typeof talk.rate === 'undefined';

const validateTalkerTalk = ({ talk, next }) => {
  switch (true) {
    case hasMissingTalkData(talk):
      return next(errors.talkMissing);
    case !validateTalkerWatchedAt(talk.watchedAt):
      return next(errors.watchedAtInvalid);
    case !validateTalkerRate(talk.rate):
      return next(errors.rateInvalid);
    default:
      break;
  }
};

module.exports = {
  getToken,
  validateEmail,
  validatePassword,
  storeUserData,
  storeTalkerData,
  getUserData,
  validateTalkerNameAndAge,
  validateTalkerTalk,
};
