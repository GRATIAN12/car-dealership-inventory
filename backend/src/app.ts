import express, { Request, Response } from 'express';
import { Vehicle } from './vehicle';

const app = express();

app.use(express.json());

const vehicles: Vehicle[] = [];

// 1. Add a new vehicle (POST)
app.post('/api/vehicles', (req: Request, res: Response) => {
  const { id, make, model, category, price, quantity } = req.body;
  const newVehicle = new Vehicle(id, make, model, category, price, quantity);
  vehicles.push(newVehicle);
  res.status(201).json(newVehicle);
});

// 2. Retrieve all vehicles (GET)
app.get('/api/vehicles', (req: Request, res: Response) => {
  res.status(200).json(vehicles);
});

// 3. Search vehicles by make, model, category, or price range (GET)
app.get('/api/vehicles/search', (req: Request, res: Response) => {
  const { make, model, category, minPrice, maxPrice } = req.query;

  const filteredVehicles = vehicles.filter((vehicle) => {
    if (make && vehicle.make.toLowerCase() !== String(make).toLowerCase()) {
      return false;
    }
    if (model && vehicle.model.toLowerCase() !== String(model).toLowerCase()) {
      return false;
    }
    if (category && vehicle.category.toLowerCase() !== String(category).toLowerCase()) {
      return false;
    }
    if (minPrice !== undefined && vehicle.price < Number(minPrice)) {
      return false;
    }
    if (maxPrice !== undefined && vehicle.price > Number(maxPrice)) {
      return false;
    }
    return true;
  });

  res.status(200).json(filteredVehicles);
});

// 4. Update an existing vehicle (PUT)
app.put('/api/vehicles/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { make, model, category, price, quantity } = req.body;

  const vehicle = vehicles.find((v) => v.id === id);
  if (!vehicle) {
    return res.status(404).json({ message: 'Vehicle not found' });
  }

  if (make !== undefined) vehicle.make = make;
  if (model !== undefined) vehicle.model = model;
  if (category !== undefined) vehicle.category = category;
  if (price !== undefined) vehicle.price = price;
  if (quantity !== undefined) vehicle.quantity = quantity;

  res.status(200).json(vehicle);
});

// Endpoint to delete a vehicle (DELETE - Admin only)
app.delete('/api/vehicles/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = vehicles.findIndex((v) => v.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Vehicle not found' });
  }

  vehicles.splice(index, 1);
  res.status(200).json({ message: 'Vehicle deleted successfully' });
});
// Endpoint to purchase a vehicle (decreasing quantity, min 0)
app.post('/api/vehicles/:id/purchase', (req: Request, res: Response) => {
  const { id } = req.params;
  const vehicle = vehicles.find((v) => v.id === id);

  if (!vehicle) {
    return res.status(404).json({ message: 'Vehicle not found' });
  }

  if (vehicle.quantity <= 0) {
    return res.status(400).json({ message: 'Vehicle out of stock' });
  }

  vehicle.quantity -= 1;
  res.status(200).json(vehicle);
});

export default app;