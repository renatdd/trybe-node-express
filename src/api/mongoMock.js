const { MongoClient } = require('mongodb');
const { MongoMemoryServer } = require('mongodb-memory-server');

const dbOptions = { useNewUrlParser: true, useUnifiedTopology: true };

const getConnection = async () => {
  const mongoServer = await MongoMemoryServer.create();
  const uriMock = await mongoServer.getUri();
  return MongoClient.connect(uriMock, dbOptions);
};

module.exports = { getConnection };
