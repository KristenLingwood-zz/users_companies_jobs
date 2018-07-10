const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');
const {
  ensureCorrectUser,
  ensureLoggedIn,
  ensureCorrectCompany
} = require('../middleware/auth');

router.get('', ensureLoggedIn, async function(req, res, next) {
  try {
    const data = await db.query('SELECT * FROM companies');
    return res.json(data.rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.get('/:id', ensureLoggedIn, async function(req, res, next) {
  try {
    const companyData = await db.query('SELECT * FROM companies WHERE id=$1', [
      req.params.id
    ]);
    const employees = await db.query(
      'SELECT id FROM users WHERE current_company_id=$1',
      [req.params.id]
    );
    companyData.rows[0].employees = employees.rows;
    return res.json(companyData.rows);
  } catch (err) {
    return next(err);
  }
});

router.post('', async (req, res, next) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newCompany = await db.query(
      'INSERT INTO companies (name, logo, handle, password) VALUES ($1, $2, $3, $4) RETURNING name, logo, handle',
      [req.body.name, req.body.logo, req.body.handle, hashedPassword]
    );
    return res.json(newCompany.rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.post('/auth', async (req, res, next) => {
  try {
    const found_company = await db.query(
      'SELECT * FROM companies WHERE handle=$1',
      [req.body.handle]
    );
    if (found_company.rows.length === 0) {
      return res.json({
        message: 'Invalid company handle'
      });
    }
    const result = await bcrypt.compare(
      req.body.password,
      found_company.rows[0].password
    );
    if (result === false) {
      return res.json({
        message: 'Invalid password'
      });
    } else {
      const token = jsonwebtoken.sign(
        {
          company_id: found_company.rows[0].id
        },
        'key123'
      );
      return res.json({ token });
    }
  } catch (err) {
    res.json({
      message: 'unauthorized'
    });
  }
});

router.patch('/:id', ensureCorrectCompany, async (req, res, next) => {
  try {
    const data = await db.query(
      'UPDATE companies SET name=$1, logo=$2 WHERE id=$3 RETURNING *',
      [req.body.name, req.body.logo, req.params.id]
    );
    return res.json(data.rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.delete('/:id', ensureCorrectCompany, async (req, res, next) => {
  try {
    await db.query('DELETE FROM companies WHERE id=$1', [req.params.id]);
    return res.json({ message: 'company deleted' });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
