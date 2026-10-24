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

// NEW: Endpoint to retrieve all vehicles (GET)
app.get('/api/vehicles', (req: Request, res: Response) => {
  res.status(200).json(vehicles);
});

export default app;