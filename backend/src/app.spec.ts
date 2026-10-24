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

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject(newVehicleData);
  });

  it('should retrieve a list of all vehicles via GET /api/vehicles', async () => {
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

  // NEW TEST: Search vehicles by make, model, category, or price range
  it('should search for vehicles by make, category, and price range via GET /api/vehicles/search', async () => {
    // Seed a couple of vehicles for searching
    await request(app).post('/api/vehicles').send({
      id: 'v-search-1',
      make: 'Toyota',
      model: 'RAV4',
      category: 'SUV',
      price: 30000,
      quantity: 4
    });

    await request(app).post('/api/vehicles').send({
      id: 'v-search-2',
      make: 'Toyota',
      model: 'Corolla',
      category: 'Sedan',
      price: 21000,
      quantity: 8
    });

    // Search for Toyota SUVs with a price between 25000 and 35000
    const response = await request(app)
      .get('/api/vehicles/search')
      .query({ make: 'Toyota', category: 'SUV', minPrice: 25000, maxPrice: 35000 });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1);
    expect(response.body[0].model).toBe('RAV4');
  });
});