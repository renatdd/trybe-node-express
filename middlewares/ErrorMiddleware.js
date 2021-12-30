const statusCode = require('../utils/statusCode');

module.exports = (error, _req, res, next) => {
  if (error.err) return res.status(statusCode[error.err.code]).json(error);
  next();
};
