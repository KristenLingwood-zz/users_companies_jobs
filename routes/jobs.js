const express = require('express');
const router = express.Router();
const db = require('../db');
const {
  ensureCorrectUser,
  ensureLoggedIn,
  ensureCorrectCompany
} = require('../middleware/auth');

// GET /jobs - this route should list all of the jobs.
router.get('', ensureLoggedIn, async function(req, res, next) {
  try {
    const data = await db.query('SELECT * FROM jobs');
    res.json(data.rows[0]);
  } catch (err) {
    return next(err);
  }
});

// GET /jobs/:id - this route should show information about a specific job
router.get('/:id', ensureLoggedIn, async function(req, res, next) {
  try {
    const jobData = await db.query('SELECT * FROM jobs WHERE id = $1', [
      req.params.id
    ]);
    const usersData = await db.query(
      'SELECT id, last_name FROM users WHERE applied=$1',
      [req.params.id]
    );
    jobData.rows[0].usersApplied = usersData.rows;
    return res.json(jobData.rows[0]);
  } catch (err) {
    return next(err);
  }
});

// POST /jobs - this route creats a new job
router.post('/:id', ensureCorrectCompany, async (req, res, next) => {
  try {
    const data = await db.query(
      'INSERT INTO jobs (title, salary, equity, company_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.body.title, req.body.salary, req.body.equity, req.body.company_id]
    );
    return res.json(data.rows[0]);
  } catch (err) {
    return next(err);
  }
});

// PATCH /jobs/:id - this route should let you update a job by its ID
router.patch('/:id/:job_id', ensureCorrectCompany, async (req, res, next) => {
  try {
    const data = await db.query(
      'UPDATE jobs SET title=$1, salary=$2, equity=$3, company_id=$4 WHERE id=$5 RETURNING *',
      [
        req.body.title,
        req.body.salary,
        req.body.equity,
        req.body.company_id,
        req.params.job_id
      ]
    );
    res.json(data.rows[0]);
  } catch (err) {
    return next(err);
  }
});

// DELETE /jobs/:id - this route lets you delete a job posting
router.delete('/:id/:job_id', ensureCorrectCompany, async (req, res, next) => {
  try {
    await db.query('DELETE FROM jobs WHERE id=$1', [req.params.job_id]);
    res.json({ message: 'job deleted' });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
