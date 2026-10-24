import express, { Request, Response } from 'express';
import { Vehicle } from './vehicle';
import db from './database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your-super-secret-key';
const app = express();

app.use(express.json());

// 1. Add a new vehicle (POST)
app.post('/api/vehicles', (req: Request, res: Response) => {
  const { id, make, model, category, price, quantity } = req.body;
  const query = `INSERT INTO vehicles (id, make, model, category, price, quantity) VALUES (?, ?, ?, ?, ?, ?)`;
  
  db.run(query, [id, make, model, category, price, quantity], function (err) {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    const newVehicle = new Vehicle(id, make, model, category, price, quantity);
    res.status(201).json(newVehicle);
  });
});

// 2. Retrieve all vehicles (GET)
app.get('/api/vehicles', (req: Request, res: Response) => {
  db.all(`SELECT * FROM vehicles`, [], (err, rows) => {
    if (err) return res.status(500).json({ message: err.message });
    res.status(200).json(rows);
  });
});

// 3. Search vehicles by make, model, category, or price range (GET)
app.get('/api/vehicles/search', (req: Request, res: Response) => {
  const { make, model, category, minPrice, maxPrice } = req.query;
  let query = `SELECT * FROM vehicles WHERE 1=1`;
  const params: any[] = [];

  if (make) {
    query += ` AND LOWER(make) = LOWER(?)`;
    params.push(make);
  }
  if (model) {
    query += ` AND LOWER(model) = LOWER(?)`;
    params.push(model);
  }
  if (category) {
    query += ` AND LOWER(category) = LOWER(?)`;
    params.push(category);
  }
  if (minPrice !== undefined) {
    query += ` AND price >= ?`;
    params.push(Number(minPrice));
  }
  if (maxPrice !== undefined) {
    query += ` AND price <= ?`;
    params.push(Number(maxPrice));
  }

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ message: err.message });
    res.status(200).json(rows);
  });
});

// 4. Update an existing vehicle (PUT)
app.put('/api/vehicles/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { make, model, category, price, quantity } = req.body;

  db.get(`SELECT * FROM vehicles WHERE id = ?`, [id], (err, vehicle: any) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    const updatedMake = make !== undefined ? make : vehicle.make;
    const updatedModel = model !== undefined ? model : vehicle.model;
    const updatedCategory = category !== undefined ? category : vehicle.category;
    const updatedPrice = price !== undefined ? price : vehicle.price;
    const updatedQuantity = quantity !== undefined ? quantity : vehicle.quantity;

    db.run(
      `UPDATE vehicles SET make = ?, model = ?, category = ?, price = ?, quantity = ? WHERE id = ?`,
      [updatedMake, updatedModel, updatedCategory, updatedPrice, updatedQuantity, id],
      function (updateErr) {
        if (updateErr) return res.status(500).json({ message: updateErr.message });
        res.status(200).json({
          id,
          make: updatedMake,
          model: updatedModel,
          category: updatedCategory,
          price: updatedPrice,
          quantity: updatedQuantity
        });
      }
    );
  });
});

// Middleware to verify JWT token
const authenticateToken = (req: any, res: Response, next: Function) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token missing' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Middleware to check if user is admin
const requireAdmin = (req: any, res: Response, next: Function) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Endpoint to delete a vehicle (DELETE - Admin only)
app.delete('/api/vehicles/:id', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;

  db.get(`SELECT * FROM vehicles WHERE id = ?`, [id], (err, vehicle) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    db.run(`DELETE FROM vehicles WHERE id = ?`, [id], (delErr) => {
      if (delErr) return res.status(500).json({ message: delErr.message });
      res.status(200).json({ message: 'Vehicle deleted successfully' });
    });
  });
});

// Endpoint to purchase a vehicle (decreasing quantity, min 0)
app.post('/api/vehicles/:id/purchase', (req: Request, res: Response) => {
  const { id } = req.params;

  db.get(`SELECT * FROM vehicles WHERE id = ?`, [id], (err, vehicle: any) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    if (vehicle.quantity <= 0) {
      return res.status(400).json({ message: 'Vehicle out of stock' });
    }

    const newQuantity = vehicle.quantity - 1;
    db.run(`UPDATE vehicles SET quantity = ? WHERE id = ?`, [newQuantity, id], (updateErr) => {
      if (updateErr) return res.status(500).json({ message: updateErr.message });
      res.status(200).json({ ...vehicle, quantity: newQuantity });
    });
  });
});

// Endpoint to restock a vehicle (increasing quantity - Admin only)
app.post('/api/vehicles/:id/restock', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { quantity } = req.body;

  db.get(`SELECT * FROM vehicles WHERE id = ?`, [id], (err, vehicle: any) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    const addAmount = Number(quantity) || 0;
    const newQuantity = vehicle.quantity + addAmount;

    db.run(`UPDATE vehicles SET quantity = ? WHERE id = ?`, [newQuantity, id], (updateErr) => {
      if (updateErr) return res.status(500).json({ message: updateErr.message });
      res.status(200).json({ ...vehicle, quantity: newQuantity });
    });
  });
});

// Endpoint to register a new user
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { username, password, role } = req.body;

    db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, existingUser) => {
      if (err) return res.status(500).json({ message: err.message });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const userRole = role || 'user';

      db.run(
        `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`,
        [username, hashedPassword, userRole],
        (insertErr) => {
          if (insertErr) return res.status(500).json({ message: insertErr.message });
          res.status(201).json({ message: 'User registered successfully', username });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Endpoint to log in a user and return a JWT token
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user: any) => {
      if (err) return res.status(500).json({ message: err.message });
      if (!user) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }

      const token = jwt.sign({ username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
      res.status(200).json({ token });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default app;