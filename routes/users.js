const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');
const { validate } = require('jsonschema');
const userSchema = require('../schemas/userSchema');
const userPatchSchema = require('../schemas/userPatchSchema');
const { ensureCorrectUser, ensureLoggedIn } = require('../middleware/auth');

router.get('', ensureLoggedIn, async (req, res, next) => {
  try {
    const data = await db.query('SELECT * FROM users');
    return res.json(data.rows);
  } catch (err) {
    return next(err);
  }
});

router.get('/:id', ensureLoggedIn, async (req, res, next) => {
  try {
    const data = await db.query('SELECT * FROM users WHERE id=$1', [
      req.params.id
    ]);
    return res.json(data.rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.post('', async (req, res, next) => {
  try {
    const validation = validate(req.body, userSchema);
    console.log(validation);
    if (!validation.valid) {
      return next(validation.errors.map(e => e.stack));
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const data = await db.query(
      'INSERT INTO users (first_name, last_name, email, photo, username, password) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [
        req.body.first_name,
        req.body.last_name,
        req.body.email,
        req.body.photo,
        req.body.username,
        hashedPassword
      ]
    );
    return res.json(data.rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.post('/auth', async (req, res, next) => {
  try {
    const found_user = await db.query('SELECT * FROM users WHERE username=$1', [
      req.body.username
    ]);
    if (found_user.rows.length === 0) {
      return res.json({
        message: 'Invalid Username'
      });
    }
    const result = await bcrypt.compare(
      req.body.password,
      found_user.rows[0].password
    );
    if (result === false) {
      return res.json({
        message: 'Invalid Password'
      });
    } else {
      const token = jsonwebtoken.sign(
        {
          user_id: found_user.rows[0].id
        },
        'key123'
      );
      return res.json({ token });
    }
  } catch (err) {
    res.json({
      message: 'Unauthorized'
    });
  }
});

router.patch('/:id', ensureCorrectUser, async (req, res, next) => {
  try {
    const validation = validate(req.body, userPatchSchema);
    if (!validation.valid) {
      return next(validation.errors.map(e => e.stack));
    }
    const data = await db.query(
      'UPDATE users SET first_name=$1, last_name=$2, email=$3, photo=$4 WHERE id=$5 RETURNING *',
      [
        req.body.first_name,
        req.body.last_name,
        req.body.email,
        req.body.photo,
        req.params.id
      ]
    );
    return res.json(data.rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.delete('/:id', ensureCorrectUser, async (req, res, next) => {
  try {
    await db.query('DELETE FROM users WHERE ID=$1', [req.params.id]);
    return res.json({ message: 'user deleted' });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
