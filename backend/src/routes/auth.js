const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const { signToken } = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;
    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json({ message: 'All registration fields are required.' });
    }
    if (password.length < 6) return res.status(400).json({ message: 'Password must contain at least 6 characters.' });

    const [exists] = await pool.query('SELECT id FROM users WHERE email=? LIMIT 1', [email.toLowerCase()]);
    if (exists.length) return res.status(409).json({ message: 'An account with this email already exists.' });

    const passwordHash = await bcrypt.hash(password, 12);
    const [result] = await pool.query(
      'INSERT INTO users(first_name,last_name,email,phone,password_hash) VALUES(?,?,?,?,?)',
      [firstName.trim(), lastName.trim(), email.trim().toLowerCase(), phone.trim(), passwordHash]
    );

    const user = { id: result.insertId, email: email.toLowerCase(), role: 'USER' };
    res.status(201).json({ token: signToken(user), user: { ...user, firstName, lastName, phone } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Registration failed.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM users WHERE email=? LIMIT 1', [String(email || '').trim().toLowerCase()]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password || '', user.password_hash))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    res.json({
      token: signToken(user),
      user: {
        id: user.id, firstName: user.first_name, lastName: user.last_name,
        email: user.email, phone: user.phone, role: user.role
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Login failed.' });
  }
});

module.exports = router;
