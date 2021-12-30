const ProductsServices = require('../services/ProductsServices');
const statusCode = require('../utils/statusCode');

const create = async (req, res, next) => {
  const { name, quantity } = req.body;

  const newProduct = await ProductsServices.create(name, quantity);

  if (newProduct.err) return next(newProduct);

  return res.status(statusCode.created).json(newProduct);
};

const getAll = async (_req, res) => {
  const allProducts = await ProductsServices.getAll();
  return res.status(statusCode.ok).json(allProducts);
};

const getById = async (req, res) => {
  const { id } = req.params;
  const product = await ProductsServices.getById(id);
  return res.status(statusCode.ok).json(product);
};

const remove = async (req, res) => {
  const { id } = req.params;
  const product = await ProductsServices.remove(id);
  return res.status(statusCode.ok).json(product);
};

const update = async (req, res) => {
  const { id } = req.params;
  const { name, quantity } = req.body;
  const product = await ProductsServices.update(id, name, quantity);
  return res.status(statusCode.ok).json(product);
};

module.exports = {
  create,
  getAll,
  getById,
  remove,
  update,
};
