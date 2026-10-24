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

  it('should retrieve a list of all vehicles via GET /api/vehicles', async () => {
    // Ensure there is at least one vehicle in the inventory
    const vehicleData = {
      id: 'v-get-1',
      make: 'Hyundai',
      model: 'Elantra',
      category: 'Sedan',
      price: 20000,
      quantity: 5
    };

    await request(app).post('/api/vehicles').send(vehicleData);

    const response = await request(app).get('/api/vehicles');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    
    const retrievedVehicle = response.body.find((v: any) => v.id === 'v-get-1');
    expect(retrievedVehicle).toBeDefined();
    expect(retrievedVehicle.model).toBe('Elantra');
  });
});