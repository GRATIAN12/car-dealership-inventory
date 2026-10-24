import express, { Request, Response } from 'express';
import { Vehicle } from './vehicle';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your-super-secret-key';
const users: any[] = [];

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
// Endpoint to restock a vehicle (increasing quantity - Admin only)
app.post('/api/vehicles/:id/restock', (req: Request, res: Response) => {
  const { id } = req.params;
  const { quantity } = req.body;

  const vehicle = vehicles.find((v) => v.id === id);

  if (!vehicle) {
    return res.status(404).json({ message: 'Vehicle not found' });
  }

  const addAmount = Number(quantity) || 0;
  vehicle.quantity += addAmount;

  res.status(200).json(vehicle);
});
// Endpoint to register a new user
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { username, password, role } = req.body;
    
    const existingUser = users.find((u) => u.username === username);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { username, password: hashedPassword, role: role || 'user' };
    users.push(newUser);

    res.status(201).json({ message: 'User registered successfully', username: newUser.username });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Endpoint to log in a user and return a JWT token
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const user = users.find((u) => u.username === username);
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign({ username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
export default app;