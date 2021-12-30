const UsersService = require('./usersService');

const create = async (req, res, next) => {
  const { name, email, password } = req.body;
  const user = await UsersService.create({ name, email, password });

  if (user.error) return next(user);

  return res.status(201).json({ user });
};

const createAdmin = async (req, res, next) => {
  const { userId } = req;
  const { name, email, password } = req.body;

  const user = await UsersService.createAdmin({ name, email, password }, userId);

  if (user.error) return next(user);

  return res.status(201).json({ user });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  const token = await UsersService.login({ email, password });

  if (token.error) return next(token);

  return res.status(200).json({ token });
};

module.exports = {
  create,
  createAdmin,
  login,
};
