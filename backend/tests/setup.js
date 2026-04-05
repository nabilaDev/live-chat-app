const mongoose = require('mongoose');

const TEST_DB = 'mongodb://localhost:27017/chat-test'; // DB séparée pour les tests

beforeAll(async () => {
  await mongoose.connect(TEST_DB);
}, 15000);

afterEach(async () => {
  // Vide toutes les collections entre chaque test
  for (const key in mongoose.connection.collections) {
    await mongoose.connection.collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase(); // Supprime la DB de test après
  await mongoose.disconnect();
});