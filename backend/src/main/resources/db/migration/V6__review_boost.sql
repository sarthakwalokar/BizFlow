-- V6__review_boost.sql
-- Add review boost settings to businesses and create reviews table

-- 1. Add Review Configuration fields to businesses table
ALTER TABLE businesses
    ADD COLUMN IF NOT EXISTS review_slug VARCHAR(150),
    ADD COLUMN IF NOT EXISTS public_review_url VARCHAR(500),
    ADD COLUMN IF NOT EXISTS review_prompt_message VARCHAR(500) DEFAULT 'Thank you for choosing us! How was your experience today?',
    ADD COLUMN IF NOT EXISTS review_enabled BOOLEAN NOT NULL DEFAULT TRUE;

CREATE UNIQUE INDEX IF NOT EXISTS idx_businesses_review_slug ON businesses(review_slug) WHERE review_slug IS NOT NULL;

-- 2. Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id BIGSERIAL PRIMARY KEY,
    business_id BIGINT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback_text TEXT,
    customer_name VARCHAR(150),
    customer_contact VARCHAR(150),
    is_positive BOOLEAN NOT NULL,
    redirected_to_public_platform BOOLEAN NOT NULL DEFAULT FALSE,
    is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
    moderation_notes VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reviews_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

-- 3. Indexes for review queries and aggregations
CREATE INDEX IF NOT EXISTS idx_reviews_business_id ON reviews(business_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(business_id, rating);
CREATE INDEX IF NOT EXISTS idx_reviews_is_positive ON reviews(business_id, is_positive);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(business_id, created_at);
CREATE INDEX IF NOT EXISTS idx_reviews_is_hidden ON reviews(business_id, is_hidden);
