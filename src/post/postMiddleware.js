const Joi = require('joi');

const validatePost = async (req, _res, next) => {
  const { error } = Joi.object({
    title: Joi.required(),
    categoryIds: Joi.required(),
    content: Joi.required(),
  }).validate(req.body);
  if (error) return next(error);
  next();
};

module.exports = {
  validatePost,
};
