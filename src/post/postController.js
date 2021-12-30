const PostService = require('./postService');

const create = async (req, res, next) => {
  const { title, content, categoryIds } = req.body;
  const { userEmail } = req;
  const { newPost, error } = await PostService
    .create({ title, content, categoryIds, userEmail });

  if (error) return next(error);

  return res.status(201).json(newPost);
};

const getAll = async (_req, res) => {
  const categories = await PostService.getAll();
  return res.status(200).json(categories);
};

module.exports = {
  create,
  getAll,
};
