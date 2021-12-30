const { useCollection } = require('../db');

const COLLECTION_NAME = 'users';
const collection = async () => useCollection(COLLECTION_NAME);

const create = async (userData) => collection()
  .then((coll) => coll.insertOne(userData));

const findByQuery = async (query) => collection()
  .then((coll) => coll.findOne(query));

module.exports = {
  create,
  findByQuery,
};
