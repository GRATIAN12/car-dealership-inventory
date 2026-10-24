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
 it('should deny access to delete a vehicle without a token or with a regular user role', async () => {
    // Seed the vehicle so it exists in the SQLite database
    await request(app).post('/api/vehicles').send({
      id: 'v-1',
      make: 'Honda',
      model: 'Civic',
      category: 'Sedan',
      price: 22000,
      quantity: 5
    });

    // Attempt delete without token (should be 401 Unauthorized)
    const resWithoutToken = await request(app).delete('/api/vehicles/v-1');
    expect(resWithoutToken.status).toBe(401);

    // Register a regular user and get token
    await request(app).post('/api/auth/register').send({
      username: 'regularuser',
      password: 'password123',
      role: 'user'
    });
    const loginRes = await request(app).post('/api/auth/login').send({
      username: 'regularuser',
      password: 'password123'
    });
    const token = loginRes.body.token;

    // Attempt delete with regular user token (should be forbidden - 403)
    const resWithUserToken = await request(app)
      .delete('/api/vehicles/v-1')
      .set('Authorization', `Bearer ${token}`);
    
    expect(resWithUserToken.status).toBe(403);
  });
});