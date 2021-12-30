const express = require('express');
const multer = require('multer');
const path = require('path');

const RecipesController = require('./recipesController');
const validateAuth = require('../middlewares/validateAuth');
const { validateRecipe, validateRecipeId } = require('./recipesMiddleware');

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, path.join(__dirname, '..', '..', 'uploads'));
  },
  filename: (req, _file, callback) => {
    callback(null, `${req.params.id}.jpeg`);
} });
  
const upload = multer({ storage });

const recipesRouter = express.Router();

recipesRouter.post('/', validateAuth, validateRecipe, RecipesController.create);
recipesRouter.get('/', RecipesController.getAll);
recipesRouter.get('/:id', validateRecipeId, RecipesController.getById);
recipesRouter.put('/:id', validateAuth, validateRecipeId, RecipesController.update);
recipesRouter.delete('/:id', validateAuth, validateRecipeId, RecipesController.remove);
recipesRouter.put(
  '/:id/image',
  validateAuth,
  validateRecipeId,
  upload.single('image'),
  RecipesController.addImage,
);

module.exports = recipesRouter;
