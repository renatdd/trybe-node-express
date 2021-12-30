const express = require('express');
const rescue = require('express-rescue');
const CategoryController = require('./categoryController');
const { validateCategory } = require('./categoryMiddleware');
const { validateToken } = require('../middlewares');

const categoriesRouter = express.Router();

categoriesRouter.post(
  '/categories',
  rescue(validateToken),
  rescue(validateCategory),
  rescue(CategoryController.create),
);
categoriesRouter.get(
  '/categories',
  rescue(validateToken), 
  rescue(CategoryController.getAll),
);

module.exports = categoriesRouter;
