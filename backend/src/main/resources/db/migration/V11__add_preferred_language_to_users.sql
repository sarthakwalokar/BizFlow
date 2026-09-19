-- =============================================================================
-- BizFlow Schema Migration V11
-- Description: Add preferred_language column to users table for multi-language support
-- =============================================================================

-- 1. Add preferred_language column if not already present
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(20) DEFAULT 'en';

-- 2. Populate 'en' for any existing records where preferred_language is NULL
UPDATE users 
SET preferred_language = 'en' 
WHERE preferred_language IS NULL;

-- 3. Ensure future records default to 'en' and enforce NOT NULL
ALTER TABLE users ALTER COLUMN preferred_language SET DEFAULT 'en';
ALTER TABLE users ALTER COLUMN preferred_language SET NOT NULL;
