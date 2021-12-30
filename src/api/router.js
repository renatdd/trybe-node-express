const express = require('express');
const usersRouter = require('./users/usersRouter');
const recipesRouter = require('./recipes/recipesRouter');

const router = express.Router();

router.use('/', usersRouter);
router.use('/recipes', recipesRouter);

module.exports = router;
