/* eslint-disable no-undef */
// tests/unit/app.test.js

const request = require('supertest');

// Get our Express app object (we don't need the server part)
const app = require('../../src/app');

describe('app.js tests', () => {
  test('should return HTTP 404 response', async () => {
    const res = await request(app).get('/notfounderror');
    expect(res.statusCode).toBe(404);
  });

  test('Login User', async () => {
    const res = await request(app)
      .post('/login')
      .send({username: process.env.JEST_ACCOUNT_USERNAME, password: process.env.JEST_ACCOUNT_PASSWORD});

    expect(res.body.message).toBe('login successful');
    expect(res.body.token).not.toBeNull();
  });
});
