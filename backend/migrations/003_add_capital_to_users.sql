-- Add capital column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS capital DECIMAL(10, 2) DEFAULT 0.00;

-- Set some initial capital for the test user
UPDATE users SET capital = 1000.00 WHERE email = 'test@test.com';
