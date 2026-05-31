const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongod;

// Start in-memory MongoDB before all tests
beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);

  // Set required env vars for testing
  process.env.JWT_SECRET = 'test-jwt-secret-at-least-32-chars-long';
  process.env.JWT_EXPIRES_IN = '1d';
  process.env.NODE_ENV = 'test';
});

// Clear all collections between tests
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Stop server and disconnect after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});
