-- =============================================================================
-- BizFlow Schema Migration V12
-- Description: Expand business logo column from VARCHAR(255) to TEXT
--              to support base64 embedded logos and full-length image URLs
-- =============================================================================

ALTER TABLE businesses ALTER COLUMN logo TYPE TEXT;
