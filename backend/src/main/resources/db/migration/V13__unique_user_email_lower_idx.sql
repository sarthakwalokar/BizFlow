-- Description: Enforce strict case-insensitive unique constraint on users email column

-- 1. Ensure all existing emails in users table are trimmed and lowercase
UPDATE users SET email = LOWER(TRIM(email)) WHERE email IS NOT NULL;

-- 2. Create unique index on LOWER(TRIM(email)) to prevent duplicate email registrations across all casings
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_email_lower ON users (LOWER(TRIM(email)));
