-- V5__customer_and_expenses.sql
-- Create expenses table and indexes for Expense Management

CREATE TABLE IF NOT EXISTS expenses (
    id BIGSERIAL PRIMARY KEY,
    business_id BIGINT NOT NULL,
    category VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    amount NUMERIC(12, 2) NOT NULL,
    payment_method VARCHAR(30) NOT NULL,
    expense_date DATE NOT NULL,
    created_by_id BIGINT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_expenses_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    CONSTRAINT fk_expenses_created_by FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for efficient queries, filtering and aggregation
CREATE INDEX IF NOT EXISTS idx_expenses_business_id ON expenses(business_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(business_id, expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(business_id, category);
CREATE INDEX IF NOT EXISTS idx_expenses_payment_method ON expenses(business_id, payment_method);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON expenses(business_id, created_at);
