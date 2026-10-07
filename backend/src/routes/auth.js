const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const { signToken, requireAuth } = require('../middleware/auth');

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

router.get('/me', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, first_name, last_name, email, phone, role, created_at FROM users WHERE id=? LIMIT 1',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'User not found.' });
    const user = rows[0];
    res.json({
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.created_at
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to fetch user profile.' });
  }
});

router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;
    if (!firstName || !lastName || !phone) {
      return res.status(400).json({ message: 'First name, last name, and phone number are required.' });
    }
    await pool.query(
      'UPDATE users SET first_name=?, last_name=?, phone=? WHERE id=?',
      [firstName.trim(), lastName.trim(), phone.trim(), req.user.id]
    );
    const [rows] = await pool.query(
      'SELECT id, first_name, last_name, email, phone, role, created_at FROM users WHERE id=? LIMIT 1',
      [req.user.id]
    );
    const user = rows[0];
    res.json({
      message: 'Profile updated successfully.',
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.created_at
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to update profile.' });
  }
});

router.put('/password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must contain at least 6 characters.' });
    }
    const [rows] = await pool.query('SELECT password_hash FROM users WHERE id=? LIMIT 1', [req.user.id]);
    if (!rows.length) return res.status(404).json({ message: 'User not found.' });

    const isMatch = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE users SET password_hash=? WHERE id=?', [newHash, req.user.id]);
    res.json({ message: 'Password updated successfully.' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to update password.' });
  }
});

module.exports = router;
