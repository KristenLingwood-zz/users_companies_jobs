const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('', async function(req, res, next) {
  try {
    const data = await db.query('SELECT * FROM companies');
    return res.json(data.rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.get('/:id', async function(req, res, next) {
  try {
    const companyData = await db.query('SELECT * FROM companies WHERE id=$1', [
      req.params.id
    ]);
    const employees = await db.query('SELECT id FROM users WHERE current_company_id=$1', [req.params.id])
    companyData.rows[0].employees = employees.rows
    return res.json(companyData.rows);
  } catch (err) {
    return next(err);
  }
});

router.post('', async function(req, res, next) {
  try {
    const data = await db.query(
      'INSERT INTO companies (name, logo) VALUES ($1, $2) RETURNING *',
      [req.body.name, req.body.logo]
    );
    return res.json(data.rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.patch('/:id', async function(req, res, next) {
  try {
    const data = await db.query(
      'UPDATE companies (name, logo) VALUES ($1, $2) WHERE id=$3 RETURNING *',
      [req.body.name, req.body.logo, req.params.id]
    );
    return res.json(data.rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.delete('/:id', async function(req, res, next) {
  try {
    await db.query('DELETE FROM companies WHERE id=$1', [req.params.id]);
    return res.json({ message: 'company deleted' });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
