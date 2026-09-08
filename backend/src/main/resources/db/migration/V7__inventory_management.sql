-- V7: Configurable Inventory Management (Small & Large Business Support)

-- 1. Extend businesses table with business size and inventory toggle
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS business_size VARCHAR(20) NOT NULL DEFAULT 'SMALL';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS inventory_enabled BOOLEAN NOT NULL DEFAULT TRUE;

-- 2. Extend products table with stock tracking fields
ALTER TABLE products ADD COLUMN IF NOT EXISTS track_stock BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity INT NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS low_stock_threshold INT NOT NULL DEFAULT 5;

CREATE INDEX IF NOT EXISTS idx_products_track_stock ON products(business_id, track_stock);
CREATE INDEX IF NOT EXISTS idx_products_stock_quantity ON products(business_id, stock_quantity);

-- 3. Locations / Branches / Warehouses (Large Business)
CREATE TABLE IF NOT EXISTS locations (
    id BIGSERIAL PRIMARY KEY,
    business_id BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50),
    address TEXT,
    phone VARCHAR(30),
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_locations_business_id ON locations(business_id);
CREATE INDEX IF NOT EXISTS idx_locations_active ON locations(business_id, is_active);

-- 4. Suppliers / Vendors (Large Business)
CREATE TABLE IF NOT EXISTS suppliers (
    id BIGSERIAL PRIMARY KEY,
    business_id BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(150),
    phone VARCHAR(30),
    address TEXT,
    tax_number VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_suppliers_business_id ON suppliers(business_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_active ON suppliers(business_id, is_active);

-- 5. Purchases / Inward Purchase Orders (Large Business)
CREATE TABLE IF NOT EXISTS purchases (
    id BIGSERIAL PRIMARY KEY,
    business_id BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    supplier_id BIGINT REFERENCES suppliers(id) ON DELETE SET NULL,
    location_id BIGINT REFERENCES locations(id) ON DELETE SET NULL,
    purchase_number VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'RECEIVED',
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    payment_status VARCHAR(30) NOT NULL DEFAULT 'PAID',
    payment_method VARCHAR(30) NOT NULL DEFAULT 'CASH',
    purchase_date DATE NOT NULL,
    notes TEXT,
    created_by VARCHAR(100),
    created_by_user_id BIGINT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_purchases_business_id ON purchases(business_id);
CREATE INDEX IF NOT EXISTS idx_purchases_supplier_id ON purchases(business_id, supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchases_location_id ON purchases(business_id, location_id);
CREATE INDEX IF NOT EXISTS idx_purchases_date ON purchases(business_id, purchase_date);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(business_id, status);

-- 6. Purchase Line Items
CREATE TABLE IF NOT EXISTS purchase_items (
    id BIGSERIAL PRIMARY KEY,
    purchase_id BIGINT NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
    product_name_snapshot VARCHAR(150) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_cost NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00
);

CREATE INDEX IF NOT EXISTS idx_purchase_items_purchase_id ON purchase_items(purchase_id);
CREATE INDEX IF NOT EXISTS idx_purchase_items_product_id ON purchase_items(product_id);

-- 7. Location Inventories (Multi-Location Stock Balances)
CREATE TABLE IF NOT EXISTS location_inventories (
    id BIGSERIAL PRIMARY KEY,
    business_id BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    location_id BIGINT NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 0,
    low_stock_threshold INT NOT NULL DEFAULT 5,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_location_product UNIQUE (business_id, location_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_loc_inv_business ON location_inventories(business_id);
CREATE INDEX IF NOT EXISTS idx_loc_inv_loc_prod ON location_inventories(business_id, location_id, product_id);

-- 8. Stock Movements Audit Ledger
CREATE TABLE IF NOT EXISTS stock_movements (
    id BIGSERIAL PRIMARY KEY,
    business_id BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    location_id BIGINT REFERENCES locations(id) ON DELETE SET NULL,
    movement_type VARCHAR(30) NOT NULL,
    quantity INT NOT NULL,
    previous_stock INT NOT NULL,
    new_stock INT NOT NULL,
    reference_type VARCHAR(30) NOT NULL,
    reference_id BIGINT,
    reference_number VARCHAR(100),
    notes TEXT,
    created_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_business ON stock_movements(business_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(business_id, product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_type ON stock_movements(business_id, movement_type);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created ON stock_movements(business_id, created_at);
