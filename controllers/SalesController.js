const SalesServices = require('../services/SalesServices');
const statusCode = require('../utils/statusCode');
const errorObject = require('../utils/errorObject');

const create = async (req, res, next) => {
  const itensSold = req.body;

  const newSale = await SalesServices.create(itensSold);

  if (newSale.err) return next(newSale);

  return res.status(statusCode.ok).json(newSale);
};

const getAll = async (_req, res) => {
  const allProducts = await SalesServices.getAll();
  return res.status(statusCode.ok).json(allProducts);
};

const getById = async (req, res, next) => {
  const { id } = req.params;
  const sale = await SalesServices.getById(id);
  if (!sale) return next(errorObject('not_found', 'Sale not found'));
  return res.status(statusCode.ok).json(sale);
};

const remove = async (req, res) => {
  const { id } = req.params;
  const removedSale = await SalesServices.remove(id);
  return res.status(statusCode.ok).json(removedSale);
};

const update = async (req, res) => {
  const { id } = req.params;
  const itensSold = req.body;
  const updatedSale = await SalesServices.update(id, itensSold);
  return res.status(statusCode.ok).json(updatedSale);
};

module.exports = {
  create,
  getAll,
  getById,
  remove,
  update,
};
