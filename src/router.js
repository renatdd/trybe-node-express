const express = require('express');
const userRouter = require('./user/userRouter');
const categoryRouter = require('./category/categoryRouter');
const postRouter = require('./post/postRouter');

const router = express.Router();

router.use('/', userRouter);
router.use('/', categoryRouter);
router.use('/', postRouter);

module.exports = router;
