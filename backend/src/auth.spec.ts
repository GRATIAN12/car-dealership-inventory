import request from 'supertest';
import app from './app';

describe('Auth API Endpoints', () => {
  it('should register a new user successfully via POST /api/auth/register', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testadmin',
        password: 'password123',
        role: 'admin'
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message');
  });

  it('should log in an existing user and return a JWT token via POST /api/auth/login', async () => {
    // Register first
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'logintest',
        password: 'password123',
        role: 'user'
      });

    // Attempt login
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'logintest',
        password: 'password123'
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
});