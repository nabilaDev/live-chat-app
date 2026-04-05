const request = require('supertest');
const app = require('../app');

describe('POST /api/auth/register', () => {

  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'nabila', password: 'Pass123!' });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('User created successfully');
  });

  it('should reject duplicate username with 400', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'nabila', password: 'Pass123!' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'nabila', password: 'AutrePass!' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('User already exists');
  });

});

describe('POST /api/auth/login', () => {

  beforeEach(async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'nabila', password: 'Pass123!' });
  });

  it('should login and return a JWT token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'nabila', password: 'Pass123!' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.username).toBe('nabila');
    // Vérifie la structure JWT (3 parties)
    expect(res.body.token.split('.')).toHaveLength(3);
  });

  it('should reject unknown user with 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'inconnu', password: 'Pass123!' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('User not found');
  });

  it('should reject wrong password with 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'nabila', password: 'mauvais' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid credentials');
  });

});