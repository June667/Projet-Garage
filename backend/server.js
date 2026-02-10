const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const pool = require('./connexion');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// Routes

// Login (Mock or Real)
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
      const result = await pool.query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password]);
      if (result.rows.length > 0) {
          res.json({ success: true, user: result.rows[0], token: 'mock-token' });
      } else {
          res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

// Get user data
app.get('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT id, email, name, capital FROM users WHERE id = $1', [id]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Car
app.post('/cars', async (req, res) => {
  const { make, model, year, owner_id } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO cars (make, model, year, owner_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [make, model, year, owner_id || null] // Allow null owner for now if no auth context
    );
    res.json({ success: true, car: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Issue
app.post('/issues', async (req, res) => {
  const { description, severity, car_id } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO issues (description, severity, car_id) VALUES ($1, $2, $3) RETURNING *',
      [description, severity, car_id]
    );
    res.json({ success: true, issue: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get repaired issues for a user (status = 'completed' AND not yet paid)
app.get('/repaired-issues/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      `SELECT i.*, c.make, c.model 
       FROM issues i 
       JOIN cars c ON i.car_id = c.id 
       WHERE c.owner_id = $1 AND i.status = 'completed' 
       AND i.id NOT IN (SELECT issue_id FROM payments WHERE status = 'completed' AND issue_id IS NOT NULL)`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Process payment using user capital
app.post('/payments', async (req, res) => {
  const { user_id, amount, issue_id, payment_method } = req.body;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // 1. Check user capital
    const userRes = await client.query('SELECT capital FROM users WHERE id = $1 FOR UPDATE', [user_id]);
    if (userRes.rows.length === 0) {
      throw new Error('User not found');
    }

    const currentCapital = parseFloat(userRes.rows[0].capital);
    const paymentAmount = parseFloat(amount);

    if (currentCapital < paymentAmount) {
      throw new Error('Insufficient capital');
    }

    // 2. Deduct capital
    await client.query('UPDATE users SET capital = capital - $1 WHERE id = $2', [paymentAmount, user_id]);

    // 3. Record payment
    const result = await client.query(
      'INSERT INTO payments (user_id, amount, issue_id, payment_method, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [user_id, paymentAmount, issue_id, payment_method || 'capital', 'completed']
    );

    await client.query('COMMIT');
    res.json({ success: true, payment: result.rows[0], new_capital: currentCapital - paymentAmount });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    client.release();
  }
});

// Get Cars (for issue selection)
app.get('/cars', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM cars');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
