const { User } = require('../models');
const { auth } = require('../utils');

const findByEmail = async (email) => User.findOne({ where: { email } });

const create = async ({ displayName, email, password, image }) => {
  const userExists = await findByEmail(email);
  if (userExists) return { error: { type: 'userExists' } };
  await User.create({ displayName, email, password, image });
  const token = auth.createToken({ displayName, email });
  return { token };
};

const login = async ({ email, password }) => {
  const user = await findByEmail(email);
  const invalidLoginData = !user || password !== user.dataValues.password;
  if (invalidLoginData) return { error: { type: 'invalidLoginData' } };
  const token = auth.createToken({ displayName: user.dataValues.displayName, email });
  return { token };
};

const getAll = async () => User.findAll();

const getById = async (id) => {
  const user = await User.findByPk(id);
  if (!user) return { error: { type: 'userDoesNotExist' } };
  return user;
};

module.exports = {
  create,
  login,
  getAll,
  getById,
};
