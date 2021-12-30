const Joi = require('joi');

const validateCategory = async (req, _res, next) => {
  const { error } = Joi.object({
    name: Joi.string().required(),
  }).validate(req.body);
  if (error) return next(error);
  next();
};

module.exports = {
  validateCategory,
};
