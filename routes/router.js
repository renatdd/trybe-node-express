const express = require('express');
const ProductsRouter = require('./ProductsRouter');
const SalesRouter = require('./SalesRouter');

const router = express.Router();

router.use('/products', ProductsRouter);
router.use('/sales', SalesRouter);

module.exports = router;
