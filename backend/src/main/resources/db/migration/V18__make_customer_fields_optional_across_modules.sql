-- =============================================================================
-- BizFlow Schema Migration V18
-- Description: Make customer information optional across all modules and billing flows,
--              and ensure customer address and email fields are consistently available.
-- =============================================================================

-- 1. Salon Appointments: Make customer_name nullable
ALTER TABLE salon_appointments ALTER COLUMN customer_name DROP NOT NULL;

-- 2. Repair Job Cards: Make customer_name and customer_phone nullable, and add customer_address
ALTER TABLE repair_job_cards ALTER COLUMN customer_name DROP NOT NULL;
ALTER TABLE repair_job_cards ALTER COLUMN customer_phone DROP NOT NULL;
ALTER TABLE repair_job_cards ADD COLUMN IF NOT EXISTS customer_address TEXT;

-- 3. Restaurant Orders: Add customer_email and customer_address
ALTER TABLE restaurant_orders ADD COLUMN IF NOT EXISTS customer_email VARCHAR(150);
ALTER TABLE restaurant_orders ADD COLUMN IF NOT EXISTS customer_address TEXT;

-- 4. Device Serial Items: Add customer_address
ALTER TABLE device_serial_items ADD COLUMN IF NOT EXISTS customer_address TEXT;

-- 5. Education Students: Make phone nullable
ALTER TABLE edu_students ALTER COLUMN phone DROP NOT NULL;
