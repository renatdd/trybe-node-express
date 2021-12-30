const CategoryService = require('./categoryService');

const create = async (req, res) => {
  const { name } = req.body;
  const newCategory = await CategoryService.create(name);
  return res.status(201).json(newCategory);
};

const getAll = async (_req, res) => {
  const categories = await CategoryService.getAll();
  return res.status(200).json(categories);
};

module.exports = {
  create,
  getAll,
};
