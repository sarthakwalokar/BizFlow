-- =============================================================================
-- BizFlow Schema Migration V14
-- Description: Expand chk_business_type check constraint to support all industry verticals
-- =============================================================================

ALTER TABLE businesses DROP CONSTRAINT IF EXISTS chk_business_type;

ALTER TABLE businesses ADD CONSTRAINT chk_business_type CHECK (
    business_type IN (
        'RETAIL',
        'GROCERY',
        'SUPERMARKET',
        'RESTAURANT',
        'CAFE',
        'BAKERY',
        'SWEET_SHOP',
        'SALON',
        'BEAUTY_PARLOUR',
        'CLOTHING',
        'ELECTRONICS',
        'PHARMACY',
        'HARDWARE',
        'FURNITURE',
        'STATIONERY',
        'MOBILE_STORE',
        'REPAIR',
        'FITNESS',
        'HOTEL',
        'CATERING',
        'SERVICE',
        'CONSULTANCY',
        'EDUCATION',
        'OTHER'
    )
);
