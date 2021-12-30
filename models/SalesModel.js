const connection = require('./connection');
const { ObjectId } = require('mongodb');

const collection = async () => connection()
  .then((db) => db.collection('sales'));

const create = async (itensSold) => collection()
  .then((coll) => coll.insertOne({ itensSold }));

const findByQuery = async (query) => {
  const product = await collection()
    .then((coll) => coll.findOne(query));

  if (!product) return null;

  return product;
};

const getAll = async () => collection()
  .then((coll) => coll.find().toArray());

const remove = async (id) => collection()
  .then((coll) => coll.deleteOne({ _id: ObjectId(id) }));

const update = async (id, itensSold) => collection()
  .then((coll) => coll.updateOne({ _id: ObjectId(id) }, { $set: { itensSold } }));

module.exports = {
  create,
  findByQuery,
  getAll,
  remove,
  update,
};
