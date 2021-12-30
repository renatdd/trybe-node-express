const RecipesService = require('./recipesService');
const RecipesModel = require('./recipesModel');

const create = async (req, res, _next) => {
  const { name, ingredients, preparation } = req.body;
  const { userId } = req;
  const recipe = await RecipesService.create({ name, ingredients, preparation, userId });

  return res.status(201).json({ recipe });
};

const getAll = async (_req, res) => {
  const recipes = await RecipesModel.getAll();

  return res.status(200).json(recipes);
};

const getById = async (req, res, next) => {
  const { id } = req.params;
  const recipe = await RecipesService.getById({ id });

  if (recipe.error) return next(recipe);

  return res.status(200).json(recipe);
};

const update = async (req, res, _next) => {
  const { id } = req.params;
  const { userId } = req;
  const { name, ingredients, preparation } = req.body;

  const recipe = await RecipesService.update({
    id,
    newData: { name, ingredients, preparation },
    userId,
  });

  // if (recipe.error) return next(recipe);

  return res.status(200).json(recipe);
};

const remove = async (req, res) => {
  const { id } = req.params;
  const { userId } = req;

  const recipe = await RecipesService.remove({ id, userId });

  if (recipe.error) return res.status(204).json();

  return res.status(403).json(recipe);
};

const addImage = async (req, res, _next) => {
  const { id } = req.params;
  const { userId, file } = req;
  const host = req.get('host');
  const image = `${host}/src/uploads/${file.filename}`;

  const recipe = await RecipesService.update({
    id,
    newData: { image },
    userId,
  });

  // if (recipe.error) return next(recipe);

  return res.status(200).json(recipe);
};

module.exports = {
  create,
  getAll,
  getById,
  update,
  remove,
  addImage,
};
