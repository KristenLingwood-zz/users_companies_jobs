const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('', async function(req, res, next) {
  try {
    const data = await db.query('SELECT * FROM users');
    return res.json(data.rows);
  } catch (err) {
    return next(err);
  }
});

router.get('/:id', async function(req, res, next) {
  console.log('req.params are', req.params.id);
  try {
    const data = await db.query('SELECT * FROM users WHERE id=$1', [
      req.params.id
    ]);
    return res.json(data.rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.post('', async function(req, res, next) {
  try {
    const data = await db.query(
      'INSERT INTO users (first_name, last_name, email, photo) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.body.first_name, req.body.last_name, req.body.email, req.body.photo]
    );
    return res.json(data.rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.patch('/:id', async function(req, res, next) {
  try {
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

router.delete('/:id', async function(req, res, next) {
  try {
    await db.query('DELETE FROM users WHERE ID=$1', [req.params.id]);
    return res.json({ message: 'user deleted' });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
