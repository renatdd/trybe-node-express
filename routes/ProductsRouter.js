const express = require('express');
const rescue = require('express-rescue');
const {
  validateProduct,
  validateProductId,
} = require('../middlewares/ProductsMiddlewares');
const ProductsController = require('../controllers/ProductsController');

const ProductsRouter = express.Router();

ProductsRouter.post(
  '/',
  rescue(validateProduct),
  rescue(ProductsController.create),
);
ProductsRouter.get(
  '/',
  rescue(ProductsController.getAll),
);
ProductsRouter.get(
  '/:id',
  rescue(validateProductId),
  rescue(ProductsController.getById),
);
ProductsRouter.put(
  '/:id',
  rescue(validateProductId),
  rescue(validateProduct),
  rescue(ProductsController.update),
);
ProductsRouter.delete(
  '/:id',
  rescue(validateProductId),
  rescue(ProductsController.remove),
);

module.exports = ProductsRouter;
