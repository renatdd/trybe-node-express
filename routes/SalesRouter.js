const express = require('express');
const rescue = require('express-rescue');
const {
  validateSale,
  validateSaleId,
} = require('../middlewares/SalesMiddlewares');
const SalesController = require('../controllers/SalesController');

const SalesRouter = express.Router();

SalesRouter.post(
  '/',
  rescue(validateSale),
  rescue(SalesController.create),
);
SalesRouter.get(
  '/',
  rescue(SalesController.getAll),
);
SalesRouter.get(
  '/:id',
  rescue(validateSaleId),
  rescue(SalesController.getById),
);
SalesRouter.put(
  '/:id',
  rescue(validateSaleId),
  rescue(validateSale),
  rescue(SalesController.update),
);
SalesRouter.delete(
  '/:id',
  rescue(validateSaleId),
  rescue(SalesController.remove),
);

module.exports = SalesRouter;
