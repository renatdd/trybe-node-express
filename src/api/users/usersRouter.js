const express = require('express');
const UsersController = require('./usersController');
const validateAuth = require('../middlewares/validateAuth');
const { validateUser, validateLogin } = require('./usersMiddleware');

const usersRouter = express.Router();

usersRouter.post('/users', validateUser, UsersController.create);
usersRouter.post('/login', validateLogin, UsersController.login);
usersRouter.post('/users/admin', validateAuth, validateUser, UsersController.createAdmin);

module.exports = usersRouter;
