-- =============================================================================
-- BizFlow Schema Migration V17
-- Description: Audit and enhance database integrity, foreign keys, and indexes
--              Link restaurant_orders to core orders for unified billing
-- =============================================================================

-- 1. Restaurant Orders Integration with Core Orders Table
ALTER TABLE restaurant_orders
    ADD COLUMN IF NOT EXISTS core_order_id BIGINT REFERENCES orders(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_rest_orders_core_order ON restaurant_orders(core_order_id);
CREATE INDEX IF NOT EXISTS idx_rest_orders_biz_created ON restaurant_orders(business_id, created_at);

-- 2. Restaurant Tables & Items Optimization Indexes
CREATE INDEX IF NOT EXISTS idx_rest_tables_active_order ON restaurant_tables(active_order_id);
CREATE INDEX IF NOT EXISTS idx_rest_items_product ON restaurant_order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_rest_kot_status ON restaurant_kot_tickets(status);

-- 3. Core Orders & Billing Optimization Indexes
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_location_id ON orders(location_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_by_user ON orders(created_by_user_id);

CREATE INDEX IF NOT EXISTS idx_payments_biz_created ON payments(business_id, created_at);
CREATE INDEX IF NOT EXISTS idx_payments_method ON payments(payment_method);

-- 4. Electronics & Warranty Optimization Indexes
CREATE INDEX IF NOT EXISTS idx_device_product_id ON device_serial_items(product_id);
CREATE INDEX IF NOT EXISTS idx_device_biz_purchase ON device_serial_items(business_id, purchase_date);
CREATE INDEX IF NOT EXISTS idx_device_biz_expiry ON device_serial_items(business_id, warranty_expiry_date);

-- 5. Education & Coaching Module Optimization Indexes
CREATE INDEX IF NOT EXISTS idx_edu_students_status ON edu_students(business_id, status);
CREATE INDEX IF NOT EXISTS idx_edu_students_phone ON edu_students(business_id, phone);
CREATE INDEX IF NOT EXISTS idx_edu_enroll_course ON edu_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_edu_enroll_status ON edu_enrollments(business_id, payment_status);
CREATE INDEX IF NOT EXISTS idx_edu_enroll_due_date ON edu_enrollments(business_id, next_due_date);
CREATE INDEX IF NOT EXISTS idx_edu_fees_student ON edu_fee_payments(student_id);
CREATE INDEX IF NOT EXISTS idx_edu_fees_date ON edu_fee_payments(business_id, payment_date);

-- 6. Repair & Service Module Optimization Indexes
CREATE INDEX IF NOT EXISTS idx_repair_biz_payment ON repair_job_cards(business_id, payment_status);
CREATE INDEX IF NOT EXISTS idx_repair_biz_created ON repair_job_cards(business_id, created_at);

-- 7. Salon Module Optimization Indexes
CREATE INDEX IF NOT EXISTS idx_salon_appt_service ON salon_appointments(service_id);
CREATE INDEX IF NOT EXISTS idx_salon_appt_customer ON salon_appointments(customer_id);
