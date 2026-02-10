-- Database Creation
-- Note: You might need to run this part manually or as a superuser if the DB doesn't exist
-- CREATE DATABASE projet_mobile_db;

-- Connect to the database before running the table creations
-- \c projet_mobile_db;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS cars (
  id SERIAL PRIMARY KEY,
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER,
  owner_id INTEGER REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS issues (
  id SERIAL PRIMARY KEY,
  description TEXT NOT NULL,
  severity VARCHAR(50),
  car_id INTEGER REFERENCES cars(id),
  status VARCHAR(50) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Dummy Data for testing
INSERT INTO users (email, password, name) VALUES 
('test@test.com', 'password123', 'Test User') 
ON CONFLICT (email) DO NOTHING;

INSERT INTO cars (make, model, year, owner_id) VALUES 
('Toyota', 'Corolla', 2020, (SELECT id FROM users WHERE email='test@test.com')),
('Honda', 'Civic', 2019, (SELECT id FROM users WHERE email='test@test.com'))
ON CONFLICT DO NOTHING;
