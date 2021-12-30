const Joi = require('joi');

const validateUser = async (req, _res, next) => {
  const { error } = Joi.object({
    displayName: Joi.string().min(8).required(),
    email: Joi.string().email().required(),
    password: Joi.string().length(6).required(),
    image: Joi.string(),
  }).validate(req.body);
  if (error) return next(error);
  next();
};

const validateLogin = async (req, _res, next) => {
  const { error } = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }).validate(req.body);
  if (error) return next(error);
  next();
};

module.exports = {
  validateUser, 
  validateLogin,
};
