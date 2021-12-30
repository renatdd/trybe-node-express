const express = require('express');
const rescue = require('express-rescue');
const UserController = require('./userController');
const { validateUser, validateLogin } = require('./userMiddleware');
const { validateToken } = require('../middlewares');

const userRouter = express.Router();

userRouter.post(
  '/user',
  rescue(validateUser),
  rescue(UserController.create),
);
userRouter.get(
  '/user',
  rescue(validateToken),
  rescue(UserController.getAll),
);
userRouter.get(
  '/user/:id',
  rescue(validateToken),
  rescue(UserController.getById),
);
userRouter.post(
  '/login',
  rescue(validateLogin),
  rescue(UserController.login),
);

module.exports = userRouter;
