import request from 'supertest';
import app from './app'; 

describe('Vehicle API Endpoints', () => {
  it('should create a new vehicle via POST /api/vehicles', async () => {
    const newVehicleData = {
      id: 'v-1',
      make: 'Honda',
      model: 'Civic',
      category: 'Sedan',
      price: 22000,
      quantity: 10
    };

    const response = await request(app)
      .post('/api/vehicles')
      .send(newVehicleData);

    expect(response.status).toBe(201); // Expect a 201 Created status
    expect(response.body).toMatchObject(newVehicleData); // Expect the returned data to match what we sent
  });
});