-- Add cost to issues
ALTER TABLE issues ADD COLUMN IF NOT EXISTS cost DECIMAL(10, 2);

-- Add issue_id to payments to link payment to a specific repair
ALTER TABLE payments ADD COLUMN IF NOT EXISTS issue_id INTEGER REFERENCES issues(id);

-- Update dummy data for testing
UPDATE issues SET status = 'completed', cost = 150.00 WHERE id = 1;
UPDATE issues SET status = 'completed', cost = 85.50 WHERE id = 2;
