-- V8: Business Analytics & Reports Performance Indexes and Location Support
-- 1. Extend orders and expenses with location_id for multi-branch analytics
ALTER TABLE orders ADD COLUMN IF NOT EXISTS location_id BIGINT REFERENCES locations(id) ON DELETE SET NULL;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS location_id BIGINT REFERENCES locations(id) ON DELETE SET NULL;

-- 2. Compound performance indexes for Analytics and Reports queries
CREATE INDEX IF NOT EXISTS idx_orders_biz_created_status ON orders(business_id, created_at, order_status);
CREATE INDEX IF NOT EXISTS idx_orders_biz_location ON orders(business_id, location_id, created_at);
CREATE INDEX IF NOT EXISTS idx_expenses_biz_date ON expenses(business_id, expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_biz_location ON expenses(business_id, location_id, expense_date);
CREATE INDEX IF NOT EXISTS idx_order_items_order_product ON order_items(order_id, product_id);
CREATE INDEX IF NOT EXISTS idx_customers_biz_created ON customers(business_id, created_at);
CREATE INDEX IF NOT EXISTS idx_reviews_biz_created ON reviews(business_id, created_at);
