import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from './database';

const app = express();
app.use(express.json());

// Enable CORS so frontend (localhost:3000) can call backend (localhost:5000)
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Auth Middleware
export const authenticateToken = (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

export const requireAdmin = (req: any, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role?.toLowerCase() !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// --- AUTH ENDPOINTS ---
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role ? role.toLowerCase() : 'user';

    db.run(
      `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`,
      [username, hashedPassword, userRole],
      function (err) {
        if (err) {
          return res.status(400).json({ error: 'Username already exists' });
        }
        const token = jwt.sign({ id: this.lastID, username, role: userRole }, JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({
          message: 'User registered successfully',
          userId: this.lastID,
          token,
          role: userRole,
          username
        });
      }
    );
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user: any) => {
    if (err || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token, role: user.role, username: user.username });
  });
});

// --- VEHICLE ENDPOINTS ---
app.post('/api/vehicles', authenticateToken, (req: Request, res: Response) => {
  const { id, make, model, category, price, quantity } = req.body;
  const vehicleId = id || Date.now().toString();
  db.run(
    `INSERT INTO vehicles (id, make, model, category, price, quantity) VALUES (?, ?, ?, ?, ?, ?)`,
    [vehicleId, make, model, category, price, quantity],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.status(201).json({ id: vehicleId, make, model, category, price, quantity });
    }
  );
});

app.get('/api/vehicles', (req: Request, res: Response) => {
  db.all(`SELECT * FROM vehicles`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(rows);
  });
});

app.get('/api/vehicles/search', (req: Request, res: Response) => {
  const { make, model, category, minPrice, maxPrice } = req.query;
  let query = `SELECT * FROM vehicles WHERE 1=1`;
  const params: any[] = [];

  if (make) { query += ` AND make LIKE ?`; params.push(`%${make}%`); }
  if (model) { query += ` AND model LIKE ?`; params.push(`%${model}%`); }
  if (category) { query += ` AND category LIKE ?`; params.push(`%${category}%`); }
  if (minPrice) { query += ` AND price >= ?`; params.push(Number(minPrice)); }
  if (maxPrice) { query += ` AND price <= ?`; params.push(Number(maxPrice)); }

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(rows);
  });
});

app.put('/api/vehicles/:id', authenticateToken, (req: Request, res: Response) => {
  const { make, model, category, price, quantity } = req.body;
  db.run(
    `UPDATE vehicles SET make = ?, model = ?, category = ?, price = ?, quantity = ? WHERE id = ?`,
    [make, model, category, price, quantity, req.params.id],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.status(200).json({ id: req.params.id, make, model, category, price, quantity });
    }
  );
});

app.delete('/api/vehicles/:id', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  db.run(`DELETE FROM vehicles WHERE id = ?`, [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ message: 'Vehicle deleted' });
  });
});

app.post('/api/vehicles/:id/purchase', authenticateToken, (req: Request, res: Response) => {
  db.get(`SELECT * FROM vehicles WHERE id = ?`, [req.params.id], (err, vehicle: any) => {
    if (err || !vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    if (vehicle.quantity <= 0) return res.status(400).json({ error: 'Vehicle out of stock' });

    const newQuantity = vehicle.quantity - 1;
    db.run(`UPDATE vehicles SET quantity = ? WHERE id = ?`, [newQuantity, req.params.id], function (updateErr) {
      if (updateErr) return res.status(500).json({ error: updateErr.message });
      res.status(200).json({ ...vehicle, quantity: newQuantity });
    });
  });
});

app.post('/api/vehicles/:id/restock', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  const amount = Number(req.body.quantity) || 1;
  db.get(`SELECT * FROM vehicles WHERE id = ?`, [req.params.id], (err, vehicle: any) => {
    if (err || !vehicle) return res.status(404).json({ error: 'Vehicle not found' });

    const newQuantity = vehicle.quantity + amount;
    db.run(`UPDATE vehicles SET quantity = ? WHERE id = ?`, [newQuantity, req.params.id], function (updateErr) {
      if (updateErr) return res.status(500).json({ error: updateErr.message });
      res.status(200).json({ ...vehicle, quantity: newQuantity });
    });
  });
});

// Start the server when run directly via npm start
const PORT = 5000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

export default app;