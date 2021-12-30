require('dotenv').config();
const { MongoClient } = require('mongodb');

const MONGO_DB_URL = process.env.MONGO_DB_URL || 'mongodb://mongodb:27017/Cookmaster';
const DB_NAME = 'Cookmaster';
const DB_OPTIONS = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

let mongodb = null;

const connection = () => (
  mongodb
    ? Promise.resolve(mongodb)
    : MongoClient.connect(MONGO_DB_URL, DB_OPTIONS)
      .then((conn) => {
        mongodb = conn.db(DB_NAME);
        return mongodb;
      })
);

const useCollection = async (collection) => connection()
  .then((db) => db.collection(collection));

module.exports = { useCollection };
