const jwt = require('jsonwebtoken');
const { ObjectID } = require('mongodb');
const UsersModel = require('./usersModel');
const jwtSecret = require('../jwtSecret');

const jwtOptions = {
  expiresIn: '7d',
  algorithm: 'HS256',
};

const create = async ({ name, email, password, role = 'user' }) => {
  const existingEmail = await UsersModel.findByQuery({ email });

  if (existingEmail) return { error: 'existingEmail' };

  const { ops: [newUserEntry] } = await UsersModel.create({ name, email, password, role });
  const { password: _, ...newUserData } = newUserEntry;
  return newUserData;
};

const createAdmin = async ({ name, email, password, role = 'admin' }, loggedUserId) => {
  const loggedUser = await UsersModel.findByQuery(ObjectID(loggedUserId));
  const isUserAdmin = loggedUser && loggedUser.role === 'admin';

  if (!isUserAdmin) return { error: 'createAdminNotAllowed' };

  return create({ name, email, password, role });
};

const login = async ({ email, password }) => {
  const user = await UsersModel.findByQuery({ email });
  const isWrongPassword = user && password !== user.password;

  if (!user || isWrongPassword) return { error: 'invalidLoginData' };

  const { password: _, ...userData } = user;
  const token = jwt.sign(userData, jwtSecret, jwtOptions);
  return token;
};

module.exports = {
  create,
  createAdmin,
  login,
};
