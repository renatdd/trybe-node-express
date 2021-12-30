const { useCollection } = require('../db');

const COLLECTION_NAME = 'recipes';
const collection = async () => useCollection(COLLECTION_NAME);

const create = async (recipeData) => collection()
  .then((coll) => coll.insertOne(recipeData));

const findByQuery = async (query) => collection()
  .then((coll) => coll.findOne(query));

const getAll = async () => collection()
  .then((coll) => coll.find().toArray());

const remove = async (_id) => collection()
  .then((coll) => coll.deleteOne({ _id }));

const update = async (_id, newData) => collection()
  .then((coll) => coll.updateOne({ _id }, { $set: { ...newData } }));

module.exports = {
  create,
  findByQuery,
  getAll,
  remove,
  update,
};
