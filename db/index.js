const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://localhost/users_companies_jobs_db'
});

client.connect();

module.exports = client;
