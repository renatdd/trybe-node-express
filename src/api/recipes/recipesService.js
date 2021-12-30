const { ObjectID } = require('mongodb');
const RecipesModel = require('./recipesModel');
const UsersModel = require('../users/usersModel');

const create = async ({ name, ingredients, preparation, userId }) => {
  const { ops: [newRecipeEntry] } = await RecipesModel.create(
    { name, ingredients, preparation, userId },
  );
  return newRecipeEntry;
};

const getById = async ({ id }) => {
  const recipe = await RecipesModel.findByQuery(ObjectID(id));

  if (!recipe) return { error: 'recipeNotFound' };

  return recipe;
};

const doRestrictAction = async ({ id, userId, callback, params }) => {
  let recipe = await getById({ id });
  const isUserOwner = recipe.userId === userId;
  let isUserAdmin = false;
  
  if (!isUserOwner) {
    const user = await UsersModel.findByQuery(ObjectID(userId));
    isUserAdmin = user && user.role === 'admin';
  }
  
  if (isUserOwner || isUserAdmin) {
    await callback(...params);
    recipe = await getById({ id });
  }

  return recipe;
};

const update = async ({ id, newData, userId }) => doRestrictAction({
  id,
  userId,
  callback: RecipesModel.update,
  params: [ObjectID(id), newData],
});

const remove = async ({ id, userId }) => doRestrictAction({
  id,
  userId,
  callback: RecipesModel.remove,
  params: [ObjectID(id)],
});

module.exports = {
  create,
  getById,
  remove,
  update,
};
