-- =============================================================================
-- BizFlow Schema Migration V16
-- Description: Add reservation customer details and notes to restaurant_tables
-- =============================================================================

ALTER TABLE restaurant_tables
    ADD COLUMN IF NOT EXISTS reservation_customer_name VARCHAR(150),
    ADD COLUMN IF NOT EXISTS reservation_customer_phone VARCHAR(50),
    ADD COLUMN IF NOT EXISTS reservation_notes TEXT,
    ADD COLUMN IF NOT EXISTS reservation_time VARCHAR(100);
