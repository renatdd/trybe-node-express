const express = require('express');
const rescue = require('express-rescue');
const PostController = require('./postController');
const { validatePost } = require('./postMiddleware');
const { validateToken } = require('../middlewares');

const postRouter = express.Router();

postRouter.post(
  '/post',
  rescue(validateToken),
  rescue(validatePost),
  rescue(PostController.create),
);
postRouter.get(
  '/post',
  rescue(validateToken), 
  rescue(PostController.getAll),
);

module.exports = postRouter;
