require('dotenv').config();
const jwt = require('jsonwebtoken');

const { JWT_SECRET } = process.env;

const jwtOptions = {
  expiresIn: '7d',
  algorithm: 'HS256',
};

const createToken = (data) => jwt.sign(data, JWT_SECRET, jwtOptions);

const validateToken = (token) => jwt.verify(token, JWT_SECRET);

module.exports = {
  createToken,
  validateToken,
};
