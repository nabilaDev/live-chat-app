const request = require('supertest');
const app = require('../app');

describe('Routes existantes', () => {

  it('GET /health → 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
  });

  it('GET / → 200', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
  });

  it('Route inconnue → 404', async () => {
    const res = await request(app).get('/api/unknown');
    expect(res.status).toBe(404);
  });

});