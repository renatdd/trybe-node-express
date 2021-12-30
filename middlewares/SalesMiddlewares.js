const { ObjectId } = require('mongodb');
const errorObject = require('../utils/errorObject');

const QUANTITY_MIN = 1;

const checkQuantity = (quantity) => (
  typeof quantity === 'number' && quantity >= QUANTITY_MIN
);

const checkId = (id) => ObjectId.isValid(id);

const checkSale = (productId, quantity) => checkId(productId) && checkQuantity(quantity);

const validateSale = async (req, _res, next) => {
  const sale = req.body;
  const error = sale.some(({ productId, quantity }) => !checkSale(productId, quantity));

  if (error) return next(
    errorObject('invalid_data', 'Wrong product ID or invalid quantity')
  );

  return next();
};

const validateSaleId = (req, _res, next) => {
  const { id } = req.params;
  
  if (!ObjectId.isValid(id)) {
    if (req.method === 'DELETE') return next(
      errorObject('invalid_data', 'Wrong sale ID format')
    );
    
    return next(errorObject('not_found', 'Sale not found'));
  }

  return next();
};

module.exports = {
  validateSale,
  validateSaleId,
};
