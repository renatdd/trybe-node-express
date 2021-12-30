const Joi = require('joi');

const validateUser = async (req, _res, next) => {
  const { error } = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }).validate(req.body);
  if (error) return next({ error: 'invalidEntries' });
  next();
};

const validateLogin = async (req, _res, next) => {
  const { error } = Joi.object({
    email: Joi.required(),
    password: Joi.required(),
  }).validate(req.body);
  if (error) return next({ error: 'emptyLoginFields' });
  next();
};

module.exports = { validateUser, validateLogin };
