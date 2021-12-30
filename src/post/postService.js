const { BlogPost, User, Category } = require('../models');

const create = async ({ title, content, categoryIds, userEmail }) => {
  const user = await User.findOne({ where: { email: userEmail } });
  const post = await BlogPost.create({ title, content, userId: user.dataValues.id });
  const categories = await Category.findAll({ where: { id: categoryIds } });
  if (categories.length === 0) return { error: { type: 'categoryNotFound' } };
  await post.addCategories(categories);
  const { published, updated, ...newPost } = post.dataValues;
  return { newPost };
};

const getAll = async () => BlogPost.findAll({ include: [
  { model: User, as: 'user', attributes: ['id', 'displayName', 'email', 'image'] },
  { model: Category, as: 'categories', through: { attributes: [] } },
] });

module.exports = {
  create,
  getAll,
};
