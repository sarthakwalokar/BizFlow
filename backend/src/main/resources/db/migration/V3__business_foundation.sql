-- =============================================================================
-- BizFlow Schema Migration V3
-- Description: Tax settings, user permissions, categories, and products/services tables
-- =============================================================================

-- 1. Add Tax configuration to businesses table
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS tax_rate NUMERIC(5,2) DEFAULT 0.00;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS tax_name VARCHAR(50) DEFAULT 'Sales Tax';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS tax_number VARCHAR(100);
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS tax_inclusive BOOLEAN DEFAULT FALSE;

-- 2. Add permissions column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions TEXT;

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    business_id BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_category_business_name UNIQUE (business_id, name)
);

CREATE INDEX IF NOT EXISTS idx_categories_business_id ON categories (business_id);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories (is_active);

-- 4. Products and Services Table
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    business_id BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    product_type VARCHAR(30) NOT NULL DEFAULT 'PHYSICAL',
    price NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    cost_price NUMERIC(12,2) DEFAULT 0.00,
    sku VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_product_type CHECK (product_type IN ('PHYSICAL', 'SERVICE'))
);

CREATE INDEX IF NOT EXISTS idx_products_business_id ON products (business_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products (category_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products (sku);
CREATE INDEX IF NOT EXISTS idx_products_type ON products (product_type);
CREATE INDEX IF NOT EXISTS idx_products_active ON products (is_active);
