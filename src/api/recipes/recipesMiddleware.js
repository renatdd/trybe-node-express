const { ObjectID } = require('mongodb');
const Joi = require('joi');

const validateRecipe = async (req, _res, next) => {
  const { error } = Joi.object({
    name: Joi.string().required(),
    ingredients: Joi.string().required(),
    preparation: Joi.string().required(),
  }).validate(req.body);
  if (error) return next({ error: 'invalidEntries' });
  next();
};

const validateRecipeId = async (req, _res, next) => {
  const { id } = req.params;
  if (!ObjectID.isValid(id)) return next({ error: 'recipeNotFound' });
  next();
};

module.exports = {
  validateRecipe,
  validateRecipeId,
};
