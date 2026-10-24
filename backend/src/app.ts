import express, { Request, Response } from 'express';
import { Vehicle } from './vehicle';

const app = express();

// Middleware to parse incoming JSON data
app.use(express.json());

// In-memory array to simulate our database for now
// (We will swap this for a real database later)
const vehicles: Vehicle[] = [];

// The endpoint to add a new vehicle
app.post('/api/vehicles', (req: Request, res: Response) => {
  const { id, make, model, category, price, quantity } = req.body;

  // Create a new Vehicle instance
  const newVehicle = new Vehicle(id, make, model, category, price, quantity);
  
  // Add it to our "database"
  vehicles.push(newVehicle);

  // Return the created vehicle with a 201 Created status code
  res.status(201).json(newVehicle);
});

export default app;