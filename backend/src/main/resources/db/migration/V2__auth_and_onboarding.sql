-- =============================================================================
-- BizFlow Schema Migration V2
-- Description: Add logo column, full_name, enabled columns, and seed initial platform admin
-- =============================================================================

-- Add logo column to businesses
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS logo VARCHAR(255);

-- Add full_name and enabled columns to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(150);
ALTER TABLE users ADD COLUMN IF NOT EXISTS enabled BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE users ALTER COLUMN first_name DROP NOT NULL;
ALTER TABLE users ALTER COLUMN last_name DROP NOT NULL;

-- Populate full_name from existing first_name and last_name if any exist
UPDATE users 
SET full_name = TRIM(CONCAT(COALESCE(first_name, ''), ' ', COALESCE(last_name, '')))
WHERE full_name IS NULL;

-- Make sure full_name is NOT NULL for future records
ALTER TABLE users ALTER COLUMN full_name SET DEFAULT 'User';

-- Seed Platform Administrator if not exists (Password: Admin@BizFlow2026!)
INSERT INTO users (business_id, email, password_hash, full_name, first_name, last_name, phone, role, is_active, enabled, created_at, updated_at)
SELECT 
    NULL,
    'admin@bizflow.io',
    '$2a$10$e88yR7ZtYdZz1mO8F3p8quh3.nF6/0xGvT1kYxX3l9W3Z0k5M8P3C', -- BCrypt for Admin@BizFlow2026!
    'Platform Administrator',
    'Platform',
    'Administrator',
    '+1-800-555-0199',
    'ADMIN',
    TRUE,
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'admin@bizflow.io'
);
