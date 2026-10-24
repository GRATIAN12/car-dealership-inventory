import express, { Request, Response } from 'express';
import { Vehicle } from './vehicle';

const app = express();

// Middleware to parse incoming JSON data
app.use(express.json());

// In-memory array to simulate our database for now
const vehicles: Vehicle[] = [];

// Endpoint to add a new vehicle (POST)
app.post('/api/vehicles', (req: Request, res: Response) => {
  const { id, make, model, category, price, quantity } = req.body;
  const newVehicle = new Vehicle(id, make, model, category, price, quantity);
  vehicles.push(newVehicle);
  res.status(201).json(newVehicle);
});

// Endpoint to retrieve all vehicles (GET)
app.get('/api/vehicles', (req: Request, res: Response) => {
  res.status(200).json(vehicles);
});

// NEW: Endpoint to search vehicles by make, model, category, or price range (GET)
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

export default app;