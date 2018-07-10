DROP DATABASE IF EXISTS users_companies_jobs_db;

CREATE DATABASE users_companies_jobs_db;

\c users_companies_jobs_db;

CREATE TABLE companies (
  id SERIAL PRIMARY KEY, 
  name TEXT, 
  logo TEXT,
  handle TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
  );

CREATE TABLE jobs (
  id SERIAL PRIMARY KEY, 
  title TEXT, 
  salary TEXT, 
  equity float,  
  company_id INTEGER REFERENCES companies (id) ON DELETE CASCADE
  );

CREATE TABLE users (
  id SERIAL PRIMARY KEY, 
  first_name TEXT, 
  last_name TEXT, 
  email TEXT, 
  photo TEXT, 
  username TEXT UNIQUE NOT NULL, 
  password TEXT NOT NULL,
  company_id INTEGER REFERENCES companies (id) ON DELETE SET NULL
  );

CREATE TABLE jobs_users (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
  job_id INTEGER REFERENCES jobs (id) ON DELETE CASCADE
);

-- in terminal 
-- psql < schema.sql 
