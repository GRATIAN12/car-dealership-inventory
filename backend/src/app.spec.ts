import request from 'supertest';
import app from './app'; 

describe('Vehicle API Endpoints', () => {
  // 1. POST /api/vehicles
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

  // 2. GET /api/vehicles
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

  // 3. GET /api/vehicles/search
  it('should search for vehicles by make, category, and price range via GET /api/vehicles/search', async () => {
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

    const response = await request(app)
      .get('/api/vehicles/search')
      .query({ make: 'Toyota', category: 'SUV', minPrice: 25000, maxPrice: 35000 });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1);
    expect(response.body[0].model).toBe('RAV4');
  });

  // 4. PUT /api/vehicles/:id
  it('should update an existing vehicle via PUT /api/vehicles/:id', async () => {
    await request(app).post('/api/vehicles').send({
      id: 'v-update-1',
      make: 'Ford',
      model: 'Focus',
      category: 'Hatchback',
      price: 18000,
      quantity: 3
    });

    const updatedData = {
      make: 'Ford',
      model: 'Focus ST',
      category: 'Hatchback',
      price: 24000,
      quantity: 5
    };

    const response = await request(app)
      .put('/api/vehicles/v-update-1')
      .send(updatedData);

    expect(response.status).toBe(200);
    expect(response.body.model).toBe('Focus ST');
    expect(response.body.price).toBe(24000);
    expect(response.body.quantity).toBe(5);
  });
  it('should delete an existing vehicle via DELETE /api/vehicles/:id', async () => {
    // Seed a vehicle to delete
    await request(app).post('/api/vehicles').send({
      id: 'v-del-1',
      make: 'Nissan',
      model: 'Altima',
      category: 'Sedan',
      price: 19000,
      quantity: 2
    });

    // Delete the vehicle
    const deleteResponse = await request(app).delete('/api/vehicles/v-del-1');
    expect(deleteResponse.status).toBe(200);

    // Verify it is removed by attempting to fetch all vehicles
    const getResponse = await request(app).get('/api/vehicles');
    const found = getResponse.body.find((v: any) => v.id === 'v-del-1');
    expect(found).toBeUndefined();
  });
  it('should purchase a vehicle and decrease its quantity via POST /api/vehicles/:id/purchase', async () => {
    // Seed a vehicle with quantity 2
    await request(app).post('/api/vehicles').send({
      id: 'v-purchase-1',
      make: 'Mazda',
      model: 'Mazda3',
      category: 'Sedan',
      price: 20000,
      quantity: 2
    });

    // Purchase the vehicle
    const purchaseResponse = await request(app).post('/api/vehicles/v-purchase-1/purchase');
    expect(purchaseResponse.status).toBe(200);
    expect(purchaseResponse.body.quantity).toBe(1);

    // Purchase again until quantity is 0
    await request(app).post('/api/vehicles/v-purchase-1/purchase');

    // Attempting to purchase when quantity is 0 should fail with 400 Bad Request
    const failedResponse = await request(app).post('/api/vehicles/v-purchase-1/purchase');
    expect(failedResponse.status).toBe(400);
  });
  it('should restock a vehicle and increase its quantity via POST /api/vehicles/:id/restock', async () => {
    // Seed a vehicle with quantity 3
    await request(app).post('/api/vehicles').send({
      id: 'v-restock-1',
      make: 'Subaru',
      model: 'Outback',
      category: 'SUV',
      price: 32000,
      quantity: 3
    });

    // Restock the vehicle adding 5 units
    const restockResponse = await request(app)
      .post('/api/vehicles/v-restock-1/restock')
      .send({ quantity: 5 });

    expect(restockResponse.status).toBe(200);
    expect(restockResponse.body.quantity).toBe(8); // 3 + 5
  });
});