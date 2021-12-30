const { Category } = require('../models');

const create = async (name) => Category.create({ name });

const getAll = async () => Category.findAll();

module.exports = {
  create,
  getAll,
};
