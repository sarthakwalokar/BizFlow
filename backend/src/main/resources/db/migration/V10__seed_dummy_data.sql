-- =============================================================================
-- BizFlow Schema Migration V10: Comprehensive INR Dummy Data Seeding
-- Description: Seed rich, realistic demo data for Small Business (Café) and Large Business (Retail/Electronics)
-- =============================================================================

-- =============================================================================
-- 1. SMALL BUSINESS: Chai & Bites Café
-- =============================================================================

-- 1.1 Insert Small Business
INSERT INTO businesses (
    id, name, business_type, business_size, email, phone, address, currency, timezone,
    tax_rate, tax_name, tax_number, tax_inclusive, review_slug, public_review_url,
    review_prompt_message, review_enabled, inventory_enabled, is_active, created_at, updated_at
) VALUES (
    101,
    'Chai & Bites Café',
    'CAFE',
    'SMALL',
    'contact@chaiandbites.in',
    '+91-98765-43210',
    'Shop #14, 100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038',
    'INR',
    'Asia/Kolkata',
    5.00,
    'GST 5%',
    '29ABCDE1234F1Z5',
    false,
    'chai-and-bites-cafe',
    'https://g.page/r/chai-and-bites-bengaluru/review',
    'Thank you for sipping with Chai & Bites! How was your experience today?',
    true,
    true,
    true,
    CURRENT_TIMESTAMP - INTERVAL '30 days',
    CURRENT_TIMESTAMP
) ON CONFLICT (id) DO UPDATE SET
    currency = 'INR',
    business_size = 'SMALL',
    tax_rate = 5.00,
    tax_name = 'GST 5%';

-- 1.2 Seed Small Business Users (Password: Owner@12345 / Staff@12345)
-- Note: DataInitializer will also guarantee password encryption on startup
INSERT INTO users (
    id, business_id, email, password_hash, full_name, first_name, last_name, phone, role, is_active, enabled, created_at, updated_at
) VALUES 
(
    101,
    101,
    'owner@chaiandbites.in',
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', -- BCrypt for Owner@12345
    'Arjun Kapoor',
    'Arjun',
    'Kapoor',
    '+91-98765-43210',
    'OWNER',
    true,
    true,
    CURRENT_TIMESTAMP - INTERVAL '30 days',
    CURRENT_TIMESTAMP
),
(
    102,
    101,
    'staff@chaiandbites.in',
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', -- BCrypt for Staff@12345
    'Pooja Nair',
    'Pooja',
    'Nair',
    '+91-98765-43211',
    'STAFF',
    true,
    true,
    CURRENT_TIMESTAMP - INTERVAL '30 days',
    CURRENT_TIMESTAMP
) ON CONFLICT (email) DO UPDATE SET
    business_id = EXCLUDED.business_id,
    role = EXCLUDED.role,
    enabled = true;

-- 1.3 Seed Categories for Small Business
INSERT INTO categories (id, business_id, name, description, is_active, created_at, updated_at)
VALUES
(101, 101, 'Hot Beverages', 'Traditional Masala Chai, Special Teas, Artisan Filter Coffee & Hot Cocoa', true, CURRENT_TIMESTAMP - INTERVAL '30 days', CURRENT_TIMESTAMP),
(102, 101, 'Cold Brews & Coolers', 'Iced Frappes, Cold Coffee, Fresh Mojitos & Milkshakes', true, CURRENT_TIMESTAMP - INTERVAL '30 days', CURRENT_TIMESTAMP),
(103, 101, 'Artisan Bakery', 'Freshly baked muffins, cookies, croissants & pastries', true, CURRENT_TIMESTAMP - INTERVAL '30 days', CURRENT_TIMESTAMP),
(104, 101, 'Snacks & Sandwiches', 'Gourmet grilled sandwiches, sourdough toasts & savory quick bites', true, CURRENT_TIMESTAMP - INTERVAL '30 days', CURRENT_TIMESTAMP),
(105, 101, 'Desserts & Sweets', 'Decadent chocolate brownies, cheesecakes & sundaes', true, CURRENT_TIMESTAMP - INTERVAL '30 days', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 1.4 Seed Products for Small Business (INR Pricing)
INSERT INTO products (
    id, business_id, category_id, name, description, product_type, price, cost_price, sku, track_stock, stock_quantity, low_stock_threshold, is_active, created_at, updated_at
) VALUES
(101, 101, 101, 'Kadak Masala Chai Special', 'Signature freshly brewed spiced milk tea with ginger, cardamom, and clove.', 'PHYSICAL', 30.00, 8.00, 'CHAI-MASALA-01', true, 180, 20, true, CURRENT_TIMESTAMP - INTERVAL '30 days', CURRENT_TIMESTAMP),
(102, 101, 101, 'South Indian Filter Coffee', 'Traditional strong decoction blended with frothy boiled milk.', 'PHYSICAL', 45.00, 12.00, 'COF-FILTER-02', true, 140, 15, true, CURRENT_TIMESTAMP - INTERVAL '30 days', CURRENT_TIMESTAMP),
(103, 101, 101, 'Ginger Lemon Green Tea', 'Refreshing antioxidant green tea infused with fresh ginger and honey.', 'PHYSICAL', 60.00, 15.00, 'TEA-GRN-GIN-03', true, 85, 10, true, CURRENT_TIMESTAMP - INTERVAL '30 days', CURRENT_TIMESTAMP),
(104, 101, 102, 'Iced Caramel Frappe', 'Blended double espresso, caramel syrup, chilled milk, and whipped cream.', 'PHYSICAL', 160.00, 48.00, 'BEV-FRAP-CAR-04', true, 60, 10, true, CURRENT_TIMESTAMP - INTERVAL '30 days', CURRENT_TIMESTAMP),
(105, 101, 102, 'Belgian Cold Coffee Float', 'Thick creamy cold coffee topped with rich vanilla ice cream scoop.', 'PHYSICAL', 140.00, 42.00, 'BEV-CLD-COF-05', true, 75, 10, true, CURRENT_TIMESTAMP - INTERVAL '30 days', CURRENT_TIMESTAMP),
(106, 101, 103, 'Wild Blueberry Muffin', 'Soft golden muffin baked with juicy wild blueberries.', 'PHYSICAL', 95.00, 32.00, 'BAK-MUF-BLU-06', true, 28, 8, true, CURRENT_TIMESTAMP - INTERVAL '30 days', CURRENT_TIMESTAMP),
(107, 101, 103, 'Butter Croissant', 'Flaky, buttery French-style croissant freshly baked every morning.', 'PHYSICAL', 85.00, 28.00, 'BAK-CRS-BUT-07', true, 22, 6, true, CURRENT_TIMESTAMP - INTERVAL '30 days', CURRENT_TIMESTAMP),
(108, 101, 104, 'Gourmet Paneer Tikka Sandwich', 'Spiced cottage cheese cubes, mint chutney, bell peppers in grilled bread.', 'PHYSICAL', 180.00, 62.00, 'SNK-SND-PAN-08', true, 45, 10, true, CURRENT_TIMESTAMP - INTERVAL '30 days', CURRENT_TIMESTAMP),
(109, 101, 104, 'Cheesy Garlic Sourdough Toast', 'Toasted artisan sourdough with roasted garlic butter and melted mozzarella.', 'PHYSICAL', 130.00, 40.00, 'SNK-TOA-GAR-09', true, 35, 8, true, CURRENT_TIMESTAMP - INTERVAL '30 days', CURRENT_TIMESTAMP),
(110, 101, 105, 'Warm Belgian Chocolate Brownie', 'Fudgy dark chocolate brownie served warm with chocolate drizzle.', 'PHYSICAL', 140.00, 45.00, 'DES-BRN-BEL-10', true, 30, 8, true, CURRENT_TIMESTAMP - INTERVAL '30 days', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 1.5 Seed Customers for Small Business
INSERT INTO customers (id, business_id, name, phone, email, address, notes, created_at, updated_at)
VALUES
(101, 101, 'Rahul Sharma', '+91-98450-12345', 'rahul.sharma@gmail.com', '12th Main, HAL 2nd Stage, Indiranagar, Bengaluru', 'Prefers less sugar in chai. Regular morning customer.', CURRENT_TIMESTAMP - INTERVAL '25 days', CURRENT_TIMESTAMP),
(102, 101, 'Priya Venkatesh', '+91-98451-23456', 'priya.venkat@outlook.com', 'Defence Colony, Indiranagar, Bengaluru', 'Loves blueberry muffins and cold brews.', CURRENT_TIMESTAMP - INTERVAL '20 days', CURRENT_TIMESTAMP),
(103, 101, 'Amitabh Roy', '+91-98452-34567', 'amit.roy@techcorp.in', 'EGL Business Park, Domlur, Bengaluru', 'Corporate orders coordinator for team meetings.', CURRENT_TIMESTAMP - INTERVAL '18 days', CURRENT_TIMESTAMP),
(104, 101, 'Sneha Hegde', '+91-98453-45678', 'sneha.hegde@yahoo.com', 'CMH Road, Indiranagar, Bengaluru', 'Weekend brunch regular with friends.', CURRENT_TIMESTAMP - INTERVAL '15 days', CURRENT_TIMESTAMP),
(105, 101, 'Vikram Deshmukh', '+91-98454-56789', 'vikram.d@gmail.com', 'Cambridge Layout, Ulsoor, Bengaluru', 'Filter coffee enthusiast.', CURRENT_TIMESTAMP - INTERVAL '10 days', CURRENT_TIMESTAMP),
(106, 101, 'Ananya Sen', '+91-98455-67890', 'ananya.sen@gmail.com', 'Old Airport Road, Bengaluru', 'Work-from-café regular on Thursdays.', CURRENT_TIMESTAMP - INTERVAL '8 days', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 1.6 Seed POS Orders & Order Items & Payments for Small Business
INSERT INTO orders (id, business_id, customer_id, invoice_number, subtotal, discount, tax, total, payment_status, order_status, payment_method, created_by, created_by_user_id, notes, created_at, updated_at)
VALUES
(101, 101, 101, 'INV-CB-1001', 125.00, 0.00, 6.25, 131.25, 'COMPLETED', 'COMPLETED', 'UPI', 'Arjun Kapoor', 101, 'Dine-in Order', CURRENT_TIMESTAMP - INTERVAL '6 days 4 hours', CURRENT_TIMESTAMP - INTERVAL '6 days 4 hours'),
(102, 101, 102, 'INV-CB-1002', 255.00, 20.00, 11.75, 246.75, 'COMPLETED', 'COMPLETED', 'CARD', 'Pooja Nair', 102, 'Special promo discount applied', CURRENT_TIMESTAMP - INTERVAL '5 days 6 hours', CURRENT_TIMESTAMP - INTERVAL '5 days 6 hours'),
(103, 101, 103, 'INV-CB-1003', 680.00, 50.00, 31.50, 661.50, 'COMPLETED', 'COMPLETED', 'UPI', 'Arjun Kapoor', 101, 'Team breakfast parcel', CURRENT_TIMESTAMP - INTERVAL '4 days 2 hours', CURRENT_TIMESTAMP - INTERVAL '4 days 2 hours'),
(104, 101, 104, 'INV-CB-1004', 310.00, 0.00, 15.50, 325.50, 'COMPLETED', 'COMPLETED', 'CASH', 'Pooja Nair', 102, 'Table #3', CURRENT_TIMESTAMP - INTERVAL '3 days 5 hours', CURRENT_TIMESTAMP - INTERVAL '3 days 5 hours'),
(105, 101, 105, 'INV-CB-1005', 175.00, 0.00, 8.75, 183.75, 'COMPLETED', 'COMPLETED', 'UPI', 'Pooja Nair', 102, 'Quick counter takeaway', CURRENT_TIMESTAMP - INTERVAL '2 days 3 hours', CURRENT_TIMESTAMP - INTERVAL '2 days 3 hours'),
(106, 101, 106, 'INV-CB-1006', 420.00, 25.00, 19.75, 414.75, 'COMPLETED', 'COMPLETED', 'UPI', 'Arjun Kapoor', 101, 'Window table #1', CURRENT_TIMESTAMP - INTERVAL '1 days 7 hours', CURRENT_TIMESTAMP - INTERVAL '1 days 7 hours'),
(107, 101, 101, 'INV-CB-1007', 210.00, 0.00, 10.50, 220.50, 'COMPLETED', 'COMPLETED', 'UPI', 'Pooja Nair', 102, 'Morning regular order', CURRENT_TIMESTAMP - INTERVAL '6 hours', CURRENT_TIMESTAMP - INTERVAL '6 hours'),
(108, 101, 102, 'INV-CB-1008', 340.00, 0.00, 17.00, 357.00, 'COMPLETED', 'COMPLETED', 'CARD', 'Pooja Nair', 102, 'Afternoon coffee & snack', CURRENT_TIMESTAMP - INTERVAL '2 hours', CURRENT_TIMESTAMP - INTERVAL '2 hours')
ON CONFLICT (id) DO NOTHING;

-- Order Items for Small Business
INSERT INTO order_items (id, order_id, product_id, product_name_snapshot, product_type, quantity, unit_price, total, created_at, updated_at)
VALUES
(101, 101, 101, 'Kadak Masala Chai Special', 'PHYSICAL', 2.00, 30.00, 60.00, CURRENT_TIMESTAMP - INTERVAL '6 days', CURRENT_TIMESTAMP - INTERVAL '6 days'),
(102, 101, 107, 'Butter Croissant', 'PHYSICAL', 1.00, 85.00, 85.00, CURRENT_TIMESTAMP - INTERVAL '6 days', CURRENT_TIMESTAMP - INTERVAL '6 days'),
(103, 102, 104, 'Iced Caramel Frappe', 'PHYSICAL', 1.00, 160.00, 160.00, CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP - INTERVAL '5 days'),
(104, 102, 106, 'Wild Blueberry Muffin', 'PHYSICAL', 1.00, 95.00, 95.00, CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP - INTERVAL '5 days'),
(105, 103, 108, 'Gourmet Paneer Tikka Sandwich', 'PHYSICAL', 3.00, 180.00, 540.00, CURRENT_TIMESTAMP - INTERVAL '4 days', CURRENT_TIMESTAMP - INTERVAL '4 days'),
(106, 103, 105, 'Belgian Cold Coffee Float', 'PHYSICAL', 1.00, 140.00, 140.00, CURRENT_TIMESTAMP - INTERVAL '4 days', CURRENT_TIMESTAMP - INTERVAL '4 days'),
(107, 104, 108, 'Gourmet Paneer Tikka Sandwich', 'PHYSICAL', 1.00, 180.00, 180.00, CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '3 days'),
(108, 104, 109, 'Cheesy Garlic Sourdough Toast', 'PHYSICAL', 1.00, 130.00, 130.00, CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '3 days'),
(109, 105, 102, 'South Indian Filter Coffee', 'PHYSICAL', 1.00, 45.00, 45.00, CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '2 days'),
(110, 105, 109, 'Cheesy Garlic Sourdough Toast', 'PHYSICAL', 1.00, 130.00, 130.00, CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '2 days'),
(111, 106, 104, 'Iced Caramel Frappe', 'PHYSICAL', 1.00, 160.00, 160.00, CURRENT_TIMESTAMP - INTERVAL '1 days', CURRENT_TIMESTAMP - INTERVAL '1 days'),
(112, 106, 108, 'Gourmet Paneer Tikka Sandwich', 'PHYSICAL', 1.00, 180.00, 180.00, CURRENT_TIMESTAMP - INTERVAL '1 days', CURRENT_TIMESTAMP - INTERVAL '1 days'),
(113, 106, 110, 'Warm Belgian Chocolate Brownie', 'PHYSICAL', 1.00, 140.00, 140.00, CURRENT_TIMESTAMP - INTERVAL '1 days', CURRENT_TIMESTAMP - INTERVAL '1 days'),
(114, 107, 101, 'Kadak Masala Chai Special', 'PHYSICAL', 1.00, 30.00, 30.00, CURRENT_TIMESTAMP - INTERVAL '6 hours', CURRENT_TIMESTAMP - INTERVAL '6 hours'),
(115, 107, 108, 'Gourmet Paneer Tikka Sandwich', 'PHYSICAL', 1.00, 180.00, 180.00, CURRENT_TIMESTAMP - INTERVAL '6 hours', CURRENT_TIMESTAMP - INTERVAL '6 hours'),
(116, 108, 105, 'Belgian Cold Coffee Float', 'PHYSICAL', 1.00, 140.00, 140.00, CURRENT_TIMESTAMP - INTERVAL '2 hours', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
(117, 108, 108, 'Gourmet Paneer Tikka Sandwich', 'PHYSICAL', 1.00, 180.00, 180.00, CURRENT_TIMESTAMP - INTERVAL '2 hours', CURRENT_TIMESTAMP - INTERVAL '2 hours')
ON CONFLICT (id) DO NOTHING;

-- Payments for Small Business
INSERT INTO payments (id, business_id, order_id, amount, payment_method, payment_status, transaction_reference, notes, created_at, updated_at)
VALUES
(101, 101, 101, 131.25, 'UPI', 'COMPLETED', 'UPI/2026/CB91823901', 'Google Pay payment', CURRENT_TIMESTAMP - INTERVAL '6 days 4 hours', CURRENT_TIMESTAMP - INTERVAL '6 days 4 hours'),
(102, 101, 102, 246.75, 'CARD', 'COMPLETED', 'POS/HDFC/TXN8271', 'HDFC Visa Tap & Pay', CURRENT_TIMESTAMP - INTERVAL '5 days 6 hours', CURRENT_TIMESTAMP - INTERVAL '5 days 6 hours'),
(103, 101, 103, 661.50, 'UPI', 'COMPLETED', 'UPI/2026/CB91829912', 'PhonePe QR scan', CURRENT_TIMESTAMP - INTERVAL '4 days 2 hours', CURRENT_TIMESTAMP - INTERVAL '4 days 2 hours'),
(104, 101, 104, 325.50, 'CASH', 'COMPLETED', 'CASH/REGISTER-01', 'Cash tendered: ₹400, Change: ₹74.50', CURRENT_TIMESTAMP - INTERVAL '3 days 5 hours', CURRENT_TIMESTAMP - INTERVAL '3 days 5 hours'),
(105, 101, 105, 183.75, 'UPI', 'COMPLETED', 'UPI/2026/CB91830044', 'Paytm QR Payment', CURRENT_TIMESTAMP - INTERVAL '2 days 3 hours', CURRENT_TIMESTAMP - INTERVAL '2 days 3 hours'),
(106, 101, 106, 414.75, 'UPI', 'COMPLETED', 'UPI/2026/CB91835519', 'Google Pay scan', CURRENT_TIMESTAMP - INTERVAL '1 days 7 hours', CURRENT_TIMESTAMP - INTERVAL '1 days 7 hours'),
(107, 101, 107, 220.50, 'UPI', 'COMPLETED', 'UPI/2026/CB91841108', 'UPI transaction verified', CURRENT_TIMESTAMP - INTERVAL '6 hours', CURRENT_TIMESTAMP - INTERVAL '6 hours'),
(108, 101, 108, 357.00, 'CARD', 'COMPLETED', 'POS/ICICI/TXN9921', 'ICICI Mastercard Chip', CURRENT_TIMESTAMP - INTERVAL '2 hours', CURRENT_TIMESTAMP - INTERVAL '2 hours')
ON CONFLICT (id) DO NOTHING;

-- 1.7 Seed Expenses for Small Business (INR amounts)
INSERT INTO expenses (id, business_id, category, description, amount, payment_method, expense_date, created_by_id, created_at, updated_at)
VALUES
(101, 101, 'Supplies', 'Weekly Fresh Dairy & Organic Whole Milk (Nandini & Amul)', 4200.00, 'UPI', CURRENT_DATE - 6, 101, CURRENT_TIMESTAMP - INTERVAL '6 days', CURRENT_TIMESTAMP - INTERVAL '6 days'),
(102, 101, 'Supplies', 'Arabica Dark Roast Coffee Beans (Blue Tokai 5kg)', 3850.00, 'CARD', CURRENT_DATE - 5, 101, CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP - INTERVAL '5 days'),
(103, 101, 'Utilities', 'BESCOM Electricity Utility Bill - Store Meter', 5420.00, 'NET_BANKING', CURRENT_DATE - 4, 101, CURRENT_TIMESTAMP - INTERVAL '4 days', CURRENT_TIMESTAMP - INTERVAL '4 days'),
(104, 101, 'Supplies', 'Eco-friendly Biodegradable Cups, Straws & Takeaway Boxes', 2150.00, 'UPI', CURRENT_DATE - 3, 102, CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '3 days'),
(105, 101, 'Maintenance', 'Espresso Machine Servicing & Descaling by Nuova Tech', 1800.00, 'CASH', CURRENT_DATE - 1, 101, CURRENT_TIMESTAMP - INTERVAL '1 days', CURRENT_TIMESTAMP - INTERVAL '1 days'),
(106, 101, 'Marketing', 'Local Weekend Flyer Distribution & Instagram Promo', 1500.00, 'UPI', CURRENT_DATE, 101, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 1.8 Seed Reviews for Small Business
INSERT INTO reviews (id, business_id, rating, feedback_text, customer_name, customer_contact, is_positive, redirected_to_public_platform, is_hidden, moderation_notes, created_at, updated_at)
VALUES
(101, 101, 5, 'The masala chai and sourdough toasts are unmatched in Indiranagar! Cozy atmosphere and rapid service.', 'Rahul Sharma', 'rahul.sharma@gmail.com', true, true, false, 'Verified customer review', CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP - INTERVAL '5 days'),
(102, 101, 5, 'Best blueberry muffin I have ever tasted in Bengaluru. Lovely staff and great music playlist!', 'Priya Venkatesh', 'priya.venkat@outlook.com', true, true, false, 'Shared to Google Maps', CURRENT_TIMESTAMP - INTERVAL '4 days', CURRENT_TIMESTAMP - INTERVAL '4 days'),
(103, 101, 4, 'Great filter coffee and sandwiches. Seating fills up fast during evening peak hours.', 'Amitabh Roy', 'amit.roy@techcorp.in', true, true, false, NULL, CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '3 days'),
(104, 101, 5, 'Ordered breakfast for my entire engineering team. Everything arrived hot, crisp, and beautifully packaged.', 'Sneha Hegde', 'sneha.hegde@yahoo.com', true, true, false, 'Corporate customer', CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '2 days'),
(105, 101, 3, 'Chai was fantastic but waited around 10 minutes for my sandwich. Would visit again though.', 'Vikram Deshmukh', 'vikram.d@gmail.com', false, false, false, 'Staff trained on speed during rush', CURRENT_TIMESTAMP - INTERVAL '1 days', CURRENT_TIMESTAMP - INTERVAL '1 days')
ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- 2. LARGE ENTERPRISE BUSINESS: Apex Electronics & Retail Hub
-- =============================================================================

-- 2.1 Insert Large Business
INSERT INTO businesses (
    id, name, business_type, business_size, email, phone, address, currency, timezone,
    tax_rate, tax_name, tax_number, tax_inclusive, review_slug, public_review_url,
    review_prompt_message, review_enabled, inventory_enabled, is_active, created_at, updated_at
) VALUES (
    201,
    'Apex Electronics & Retail Hub',
    'RETAIL',
    'LARGE',
    'support@apexretail.in',
    '+91-80-4999-8800',
    'Apex Corporate Towers, #88 Outer Ring Road, Bellandur, Bengaluru, Karnataka 560103',
    'INR',
    'Asia/Kolkata',
    18.00,
    'GST 18%',
    '29AAACA1234F1Z8',
    false,
    'apex-electronics-hub',
    'https://g.page/r/apex-electronics-bengaluru/review',
    'Thank you for shopping at Apex Electronics! Rate your experience with us today.',
    true,
    true,
    true,
    CURRENT_TIMESTAMP - INTERVAL '60 days',
    CURRENT_TIMESTAMP
) ON CONFLICT (id) DO UPDATE SET
    currency = 'INR',
    business_size = 'LARGE',
    tax_rate = 18.00,
    tax_name = 'GST 18%';

-- 2.2 Seed Large Business Users (Password: Owner@12345 / Staff@12345)
INSERT INTO users (
    id, business_id, email, password_hash, full_name, first_name, last_name, phone, role, is_active, enabled, created_at, updated_at
) VALUES 
(
    201,
    201,
    'owner@apexretail.in',
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', -- BCrypt for Owner@12345
    'Rajesh Singhania',
    'Rajesh',
    'Singhania',
    '+91-98800-11223',
    'OWNER',
    true,
    true,
    CURRENT_TIMESTAMP - INTERVAL '60 days',
    CURRENT_TIMESTAMP
),
(
    202,
    201,
    'manager@apexretail.in',
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', -- BCrypt for Staff@12345
    'Kavita Joshi',
    'Kavita',
    'Joshi',
    '+91-98800-22334',
    'STAFF',
    true,
    true,
    CURRENT_TIMESTAMP - INTERVAL '60 days',
    CURRENT_TIMESTAMP
),
(
    203,
    201,
    'cashier@apexretail.in',
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', -- BCrypt for Staff@12345
    'Manoj Kumar',
    'Manoj',
    'Kumar',
    '+91-98800-33445',
    'STAFF',
    true,
    true,
    CURRENT_TIMESTAMP - INTERVAL '60 days',
    CURRENT_TIMESTAMP
) ON CONFLICT (email) DO UPDATE SET
    business_id = EXCLUDED.business_id,
    role = EXCLUDED.role,
    enabled = true;

-- 2.3 Seed Multi-Locations / Branches for Large Business
INSERT INTO locations (id, business_id, name, code, address, phone, is_primary, is_active, created_at, updated_at)
VALUES
(201, 201, 'Indiranagar Flagship Store', 'LOC-BLR-01', '100 Feet Road, Indiranagar, Bengaluru', '+91-80-4999-8801', true, true, CURRENT_TIMESTAMP - INTERVAL '60 days', CURRENT_TIMESTAMP),
(202, 201, 'Koramangala Tech Hub', 'LOC-BLR-02', '80 Feet Road, 4th Block, Koramangala, Bengaluru', '+91-80-4999-8802', false, true, CURRENT_TIMESTAMP - INTERVAL '50 days', CURRENT_TIMESTAMP),
(203, 201, 'Whitefield Distribution Warehouse', 'WH-WFD-01', 'Plot 42, Export Promotion Industrial Zone, Whitefield, Bengaluru', '+91-80-4999-8803', false, true, CURRENT_TIMESTAMP - INTERVAL '60 days', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 2.4 Seed Suppliers / Vendors for Large Business
INSERT INTO suppliers (id, business_id, name, contact_person, email, phone, address, tax_number, is_active, created_at, updated_at)
VALUES
(201, 201, 'Samsung India Electronics Pvt Ltd', 'Deepak Verma', 'orders@samsung-distro.in', '+91-124-488-8000', 'Two Horizon Center, Golf Course Road, Gurugram', '06AAACS1234F1Z1', true, CURRENT_TIMESTAMP - INTERVAL '60 days', CURRENT_TIMESTAMP),
(202, 201, 'Dell Technologies Distribution', 'Sunita Rao', 'distribution@dellindia.in', '+91-80-2500-3000', 'Divyasree Greens, Varthur Road, Bengaluru', '29AAACD5678G1Z2', true, CURRENT_TIMESTAMP - INTERVAL '60 days', CURRENT_TIMESTAMP),
(203, 201, 'boAt Lifestyle & Audio Supplies', 'Rohan Gupta', 'b2b@boatlifestyle.com', '+91-11-4000-7000', 'Okhla Industrial Area, Phase 3, New Delhi', '07AAACB9012H1Z3', true, CURRENT_TIMESTAMP - INTERVAL '55 days', CURRENT_TIMESTAMP),
(204, 201, 'Anchor Electricals & Accessories', 'Mohanlal Mehta', 'sales@anchorindia.com', '+91-22-2800-4000', 'Marol, Andheri East, Mumbai', '27AAACA3456J1Z4', true, CURRENT_TIMESTAMP - INTERVAL '50 days', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 2.5 Seed Categories for Large Business
INSERT INTO categories (id, business_id, name, description, is_active, created_at, updated_at)
VALUES
(201, 201, 'Smartphones & Tablets', 'Flagship Android devices, tablets, and e-readers', true, CURRENT_TIMESTAMP - INTERVAL '60 days', CURRENT_TIMESTAMP),
(202, 201, 'Laptops & Computing', 'Ultrabooks, gaming rigs, workstations, and monitors', true, CURRENT_TIMESTAMP - INTERVAL '60 days', CURRENT_TIMESTAMP),
(203, 201, 'Audio & Wearables', 'ANC wireless headphones, earbuds, and smart fitness watches', true, CURRENT_TIMESTAMP - INTERVAL '60 days', CURRENT_TIMESTAMP),
(204, 201, 'Power & Cables', 'GaN fast chargers, braided high-speed cables, and power banks', true, CURRENT_TIMESTAMP - INTERVAL '60 days', CURRENT_TIMESTAMP),
(205, 201, 'Peripherals & Accessories', 'Mechanical keyboards, ergonomic mice, webcams & docks', true, CURRENT_TIMESTAMP - INTERVAL '60 days', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 2.6 Seed Products for Large Business (INR pricing, high-volume inventory)
INSERT INTO products (
    id, business_id, category_id, name, description, product_type, price, cost_price, sku, track_stock, stock_quantity, low_stock_threshold, is_active, created_at, updated_at
) VALUES
(201, 201, 201, 'Galaxy Tab S9 FE+ 128GB Wi-Fi', '12.4-inch display, S Pen included, IP68 water resistance, long-lasting battery.', 'PHYSICAL', 44999.00, 35500.00, 'SAM-TAB-S9FE-GRY', true, 28, 5, true, CURRENT_TIMESTAMP - INTERVAL '60 days', CURRENT_TIMESTAMP),
(202, 201, 201, 'Galaxy S24 5G 256GB Onyx Black', 'Snapdragon 8 Gen 3, ProVisual Engine, AI live translate, dynamic AMOLED 2X.', 'PHYSICAL', 79999.00, 66000.00, 'SAM-PHN-S24-BLK', true, 18, 4, true, CURRENT_TIMESTAMP - INTERVAL '60 days', CURRENT_TIMESTAMP),
(203, 201, 202, 'Dell XPS 13 Ultrabook Core i7 16GB', 'Intel Core i7 13th Gen, 16GB LPDDR5, 512GB NVMe SSD, FHD+ InfinityEdge.', 'PHYSICAL', 114999.00, 92000.00, 'DEL-LAP-XPS13-SLV', true, 12, 3, true, CURRENT_TIMESTAMP - INTERVAL '60 days', CURRENT_TIMESTAMP),
(204, 201, 202, 'Dell 27" 4K UHD USB-C Hub Monitor', '3840 x 2160 IPS, 99% sRGB, 65W USB-C Power Delivery, Height adjustable.', 'PHYSICAL', 28999.00, 21500.00, 'DEL-MON-27UHD-IPS', true, 24, 5, true, CURRENT_TIMESTAMP - INTERVAL '60 days', CURRENT_TIMESTAMP),
(205, 201, 203, 'boAt Nirvana Ion ANC Earbuds', 'Hybrid Active Noise Cancellation 32dB, 120H total playback, crystal bionic sound.', 'PHYSICAL', 2999.00, 1450.00, 'BOT-EAR-NIRV-BLK', true, 85, 15, true, CURRENT_TIMESTAMP - INTERVAL '60 days', CURRENT_TIMESTAMP),
(206, 201, 203, 'boAt Wave Pro Smartwatch AMOLED', '1.96-inch HD AMOLED display, Bluetooth calling, 100+ sports modes, SpO2 sensor.', 'PHYSICAL', 3499.00, 1800.00, 'BOT-WAT-WAVE-BLU', true, 64, 10, true, CURRENT_TIMESTAMP - INTERVAL '60 days', CURRENT_TIMESTAMP),
(207, 201, 204, '65W GaN Fast Dual Port Wall Charger', 'Ultra-compact Gallium Nitride tech with USB-C PD 3.0 and USB-A QuickCharge.', 'PHYSICAL', 1899.00, 780.00, 'PWR-GAN-65W-WHT', true, 120, 20, true, CURRENT_TIMESTAMP - INTERVAL '60 days', CURRENT_TIMESTAMP),
(208, 201, 204, 'Braided 100W USB-C to USB-C Cable 2M', 'E-marker smart chip, 480Mbps data sync, heavy-duty military nylon weave.', 'PHYSICAL', 599.00, 190.00, 'CAB-USBC-100W-2M', true, 150, 25, true, CURRENT_TIMESTAMP - INTERVAL '60 days', CURRENT_TIMESTAMP),
(209, 201, 205, 'RGB Mechanical Gaming Keyboard (Red Switch)', 'Hot-swappable linear mechanical switches, aluminum frame, per-key RGB backlighting.', 'PHYSICAL', 4499.00, 2300.00, 'ACC-KBD-MECH-RED', true, 42, 8, true, CURRENT_TIMESTAMP - INTERVAL '60 days', CURRENT_TIMESTAMP),
(210, 201, 205, 'Ergonomic Vertical Wireless Mouse', 'Natural handshake posture, dual Bluetooth + 2.4GHz USB receiver, 4000 DPI sensor.', 'PHYSICAL', 1799.00, 720.00, 'ACC-MOU-ERGO-VRT', true, 55, 10, true, CURRENT_TIMESTAMP - INTERVAL '60 days', CURRENT_TIMESTAMP),
(211, 201, 205, '10-in-1 Multiport USB-C Aluminum Dock', '4K HDMI, Gigabit Ethernet, 100W PD Pass-thru, SD/TF Card Reader, 3x USB 3.0.', 'PHYSICAL', 3999.00, 1850.00, 'ACC-DCK-10IN1-GRY', true, 38, 6, true, CURRENT_TIMESTAMP - INTERVAL '60 days', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 2.7 Seed Location Inventories for Large Business
INSERT INTO location_inventories (id, business_id, location_id, product_id, quantity, low_stock_threshold, updated_at)
VALUES
(201, 201, 201, 201, 10, 2, CURRENT_TIMESTAMP),
(202, 201, 202, 201, 6, 2, CURRENT_TIMESTAMP),
(203, 201, 203, 201, 12, 4, CURRENT_TIMESTAMP),
(204, 201, 201, 202, 8, 2, CURRENT_TIMESTAMP),
(205, 201, 202, 202, 4, 2, CURRENT_TIMESTAMP),
(206, 201, 203, 202, 6, 2, CURRENT_TIMESTAMP),
(207, 201, 201, 203, 4, 1, CURRENT_TIMESTAMP),
(208, 201, 202, 203, 3, 1, CURRENT_TIMESTAMP),
(209, 201, 203, 203, 5, 2, CURRENT_TIMESTAMP),
(210, 201, 201, 205, 35, 10, CURRENT_TIMESTAMP),
(211, 201, 202, 205, 25, 8, CURRENT_TIMESTAMP),
(212, 201, 203, 205, 25, 10, CURRENT_TIMESTAMP),
(213, 201, 201, 207, 45, 10, CURRENT_TIMESTAMP),
(214, 201, 202, 207, 35, 8, CURRENT_TIMESTAMP),
(215, 201, 203, 207, 40, 10, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 2.8 Seed Inward Purchases / Purchase Orders (POs) for Large Business
INSERT INTO purchases (id, business_id, supplier_id, location_id, purchase_number, status, total_amount, payment_status, payment_method, purchase_date, notes, created_by, created_by_user_id, created_at, updated_at)
VALUES
(201, 201, 201, 203, 'PO-2026-SAM-001', 'RECEIVED', 710000.00, 'PAID', 'NET_BANKING', CURRENT_DATE - 28, 'Inward shipment of Galaxy Tabs & S24 devices', 'Rajesh Singhania', 201, CURRENT_TIMESTAMP - INTERVAL '28 days', CURRENT_TIMESTAMP - INTERVAL '28 days'),
(202, 201, 202, 203, 'PO-2026-DEL-002', 'RECEIVED', 920000.00, 'PAID', 'NET_BANKING', CURRENT_DATE - 20, 'Q1 Stock: Dell XPS Ultrabooks and 4K Displays', 'Kavita Joshi', 202, CURRENT_TIMESTAMP - INTERVAL '20 days', CURRENT_TIMESTAMP - INTERVAL '20 days'),
(203, 201, 203, 203, 'PO-2026-BOT-003', 'RECEIVED', 260500.00, 'PAID', 'NET_BANKING', CURRENT_DATE - 14, 'Bulk audio lot: Nirvana Ion ANC & Wave Smartwatches', 'Kavita Joshi', 202, CURRENT_TIMESTAMP - INTERVAL '14 days', CURRENT_TIMESTAMP - INTERVAL '14 days'),
(204, 201, 204, 201, 'PO-2026-ANC-004', 'RECEIVED', 145000.00, 'PAID', 'UPI', CURRENT_DATE - 7, 'Direct store delivery: GaN Chargers, Braided Cables & Peripherals', 'Manoj Kumar', 203, CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP - INTERVAL '7 days')
ON CONFLICT (id) DO NOTHING;

-- Purchase line items
INSERT INTO purchase_items (id, purchase_id, product_id, product_name_snapshot, quantity, unit_cost, subtotal)
VALUES
(201, 201, 201, 'Galaxy Tab S9 FE+ 128GB Wi-Fi', 10, 35500.00, 355000.00),
(202, 201, 202, 'Galaxy S24 5G 256GB Onyx Black', 5, 66000.00, 330000.00),
(203, 202, 203, 'Dell XPS 13 Ultrabook Core i7 16GB', 10, 92000.00, 920000.00),
(204, 203, 205, 'boAt Nirvana Ion ANC Earbuds', 100, 1450.00, 145000.00),
(205, 203, 206, 'boAt Wave Pro Smartwatch AMOLED', 50, 1800.00, 90000.00),
(206, 204, 207, '65W GaN Fast Dual Port Wall Charger', 100, 780.00, 78000.00),
(207, 204, 208, 'Braided 100W USB-C to USB-C Cable 2M', 200, 190.00, 38000.00)
ON CONFLICT (id) DO NOTHING;

-- 2.9 Seed Stock Movements Audit Ledger for Large Business
INSERT INTO stock_movements (id, business_id, product_id, location_id, movement_type, quantity, previous_stock, new_stock, reference_type, reference_id, reference_number, notes, created_by, created_at)
VALUES
(201, 201, 201, 203, 'PURCHASE', 10, 0, 10, 'PURCHASE', 201, 'PO-2026-SAM-001', 'Received at Whitefield Warehouse from Samsung', 'Rajesh Singhania', CURRENT_TIMESTAMP - INTERVAL '28 days'),
(202, 201, 202, 203, 'PURCHASE', 5, 0, 5, 'PURCHASE', 201, 'PO-2026-SAM-001', 'Received at Whitefield Warehouse from Samsung', 'Rajesh Singhania', CURRENT_TIMESTAMP - INTERVAL '28 days'),
(203, 201, 203, 203, 'PURCHASE', 10, 0, 10, 'PURCHASE', 202, 'PO-2026-DEL-002', 'Received at Whitefield Warehouse from Dell', 'Kavita Joshi', CURRENT_TIMESTAMP - INTERVAL '20 days'),
(204, 201, 205, 203, 'PURCHASE', 100, 0, 100, 'PURCHASE', 203, 'PO-2026-BOT-003', 'Stock inward boAt shipment', 'Kavita Joshi', CURRENT_TIMESTAMP - INTERVAL '14 days'),
(205, 201, 207, 201, 'PURCHASE', 100, 0, 100, 'PURCHASE', 204, 'PO-2026-ANC-004', 'Direct Store Delivery to Indiranagar Flagship', 'Manoj Kumar', CURRENT_TIMESTAMP - INTERVAL '7 days')
ON CONFLICT (id) DO NOTHING;

-- 2.10 Seed Customers for Large Business
INSERT INTO customers (id, business_id, name, phone, email, address, notes, created_at, updated_at)
VALUES
(201, 201, 'Vikramaditya Rao', '+91-99001-12345', 'vikram.rao@enterprise.com', 'Prestige Tech Park, Marathahalli, Bengaluru', 'IT Infrastructure Procurement Head. Bulk buyer.', CURRENT_TIMESTAMP - INTERVAL '50 days', CURRENT_TIMESTAMP),
(202, 201, 'Meera Nambiar', '+91-99002-23456', 'meera.nambiar@creativestudio.in', 'Indiranagar 12th Main, Bengaluru', 'UX Designer, purchased Dell XPS & 4K Monitor.', CURRENT_TIMESTAMP - INTERVAL '40 days', CURRENT_TIMESTAMP),
(203, 201, 'Karthik Subramanian', '+91-99003-34567', 'karthik.sub@gmail.com', 'Koramangala 3rd Block, Bengaluru', 'Gadget enthusiast, active loyalty member.', CURRENT_TIMESTAMP - INTERVAL '35 days', CURRENT_TIMESTAMP),
(204, 201, 'Divya Swaminathan', '+91-99004-45678', 'divya.swami@gmail.com', 'HSR Layout Sector 2, Bengaluru', 'Regular buyer of boAt audio accessories.', CURRENT_TIMESTAMP - INTERVAL '30 days', CURRENT_TIMESTAMP),
(205, 201, 'Rohit Malhotra', '+91-99005-56789', 'rohit.malhotra@fintech.io', 'Embassy Golf Links, Domlur, Bengaluru', 'Corporate account holder.', CURRENT_TIMESTAMP - INTERVAL '25 days', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 2.11 Seed Orders, Order Items & Payments for Large Business (INR amounts, GST 18%)
INSERT INTO orders (id, business_id, customer_id, invoice_number, subtotal, discount, tax, total, payment_status, order_status, payment_method, created_by, created_by_user_id, notes, created_at, updated_at)
VALUES
(201, 201, 201, 'INV-APEX-2001', 143998.00, 5000.00, 25019.64, 164017.64, 'COMPLETED', 'COMPLETED', 'NET_BANKING', 'Kavita Joshi', 202, 'Corporate invoice with GST credit claim', CURRENT_TIMESTAMP - INTERVAL '12 days', CURRENT_TIMESTAMP - INTERVAL '12 days'),
(202, 201, 202, 'INV-APEX-2002', 143998.00, 0.00, 25919.64, 169917.64, 'COMPLETED', 'COMPLETED', 'CARD', 'Manoj Kumar', 203, 'Flagship store retail customer - HDFC Credit Card', CURRENT_TIMESTAMP - INTERVAL '8 days', CURRENT_TIMESTAMP - INTERVAL '8 days'),
(203, 201, 203, 'INV-APEX-2003', 79999.00, 2000.00, 14039.82, 92038.82, 'COMPLETED', 'COMPLETED', 'UPI', 'Manoj Kumar', 203, 'Galaxy S24 Flagship Sale', CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP - INTERVAL '5 days'),
(204, 201, 204, 'INV-APEX-2004', 6498.00, 500.00, 1079.64, 7077.64, 'COMPLETED', 'COMPLETED', 'UPI', 'Kavita Joshi', 202, 'boAt Audio Combo pack', CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '3 days'),
(205, 201, 205, 'INV-APEX-2005', 10996.00, 1000.00, 1799.28, 11795.28, 'COMPLETED', 'COMPLETED', 'CARD', 'Manoj Kumar', 203, 'Keyboard, Vertical Mouse & GaN Charger combo', CURRENT_TIMESTAMP - INTERVAL '1 days', CURRENT_TIMESTAMP - INTERVAL '1 days'),
(206, 201, 203, 'INV-APEX-2006', 44999.00, 1500.00, 7829.82, 51328.82, 'COMPLETED', 'COMPLETED', 'UPI', 'Manoj Kumar', 203, 'Galaxy Tab S9 FE+ sale', CURRENT_TIMESTAMP - INTERVAL '5 hours', CURRENT_TIMESTAMP - INTERVAL '5 hours')
ON CONFLICT (id) DO NOTHING;

-- Order Items for Large Business
INSERT INTO order_items (id, order_id, product_id, product_name_snapshot, product_type, quantity, unit_price, total, created_at, updated_at)
VALUES
(201, 201, 203, 'Dell XPS 13 Ultrabook Core i7 16GB', 'PHYSICAL', 1.00, 114999.00, 114999.00, CURRENT_TIMESTAMP - INTERVAL '12 days', CURRENT_TIMESTAMP - INTERVAL '12 days'),
(202, 201, 204, 'Dell 27" 4K UHD USB-C Hub Monitor', 'PHYSICAL', 1.00, 28999.00, 28999.00, CURRENT_TIMESTAMP - INTERVAL '12 days', CURRENT_TIMESTAMP - INTERVAL '12 days'),
(203, 202, 203, 'Dell XPS 13 Ultrabook Core i7 16GB', 'PHYSICAL', 1.00, 114999.00, 114999.00, CURRENT_TIMESTAMP - INTERVAL '8 days', CURRENT_TIMESTAMP - INTERVAL '8 days'),
(204, 202, 204, 'Dell 27" 4K UHD USB-C Hub Monitor', 'PHYSICAL', 1.00, 28999.00, 28999.00, CURRENT_TIMESTAMP - INTERVAL '8 days', CURRENT_TIMESTAMP - INTERVAL '8 days'),
(205, 203, 202, 'Galaxy S24 5G 256GB Onyx Black', 'PHYSICAL', 1.00, 79999.00, 79999.00, CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP - INTERVAL '5 days'),
(206, 204, 205, 'boAt Nirvana Ion ANC Earbuds', 'PHYSICAL', 1.00, 2999.00, 2999.00, CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '3 days'),
(207, 204, 206, 'boAt Wave Pro Smartwatch AMOLED', 'PHYSICAL', 1.00, 3499.00, 3499.00, CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '3 days'),
(208, 205, 209, 'RGB Mechanical Gaming Keyboard (Red Switch)', 'PHYSICAL', 1.00, 4499.00, 4499.00, CURRENT_TIMESTAMP - INTERVAL '1 days', CURRENT_TIMESTAMP - INTERVAL '1 days'),
(209, 205, 210, 'Ergonomic Vertical Wireless Mouse', 'PHYSICAL', 1.00, 1799.00, 1799.00, CURRENT_TIMESTAMP - INTERVAL '1 days', CURRENT_TIMESTAMP - INTERVAL '1 days'),
(210, 205, 207, '65W GaN Fast Dual Port Wall Charger', 'PHYSICAL', 2.00, 1899.00, 3798.00, CURRENT_TIMESTAMP - INTERVAL '1 days', CURRENT_TIMESTAMP - INTERVAL '1 days'),
(211, 205, 208, 'Braided 100W USB-C to USB-C Cable 2M', 'PHYSICAL', 1.00, 599.00, 599.00, CURRENT_TIMESTAMP - INTERVAL '1 days', CURRENT_TIMESTAMP - INTERVAL '1 days'),
(212, 206, 201, 'Galaxy Tab S9 FE+ 128GB Wi-Fi', 'PHYSICAL', 1.00, 44999.00, 44999.00, CURRENT_TIMESTAMP - INTERVAL '5 hours', CURRENT_TIMESTAMP - INTERVAL '5 hours')
ON CONFLICT (id) DO NOTHING;

-- Payments for Large Business
INSERT INTO payments (id, business_id, order_id, amount, payment_method, payment_status, transaction_reference, notes, created_at, updated_at)
VALUES
(201, 201, 201, 164017.64, 'NET_BANKING', 'COMPLETED', 'NEFT/AXIS/N20268819230', 'Axis Bank Corporate NEFT Transfer', CURRENT_TIMESTAMP - INTERVAL '12 days', CURRENT_TIMESTAMP - INTERVAL '12 days'),
(202, 201, 202, 169917.64, 'CARD', 'COMPLETED', 'POS/HDFC/TXN778129', 'HDFC Diners Club Black Card', CURRENT_TIMESTAMP - INTERVAL '8 days', CURRENT_TIMESTAMP - INTERVAL '8 days'),
(203, 201, 203, 92038.82, 'UPI', 'COMPLETED', 'UPI/2026/APEX78123901', 'Google Pay UPI 2FA verified', CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP - INTERVAL '5 days'),
(204, 201, 204, 7077.64, 'UPI', 'COMPLETED', 'UPI/2026/APEX88219012', 'PhonePe QR transaction', CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '3 days'),
(205, 201, 205, 11795.28, 'CARD', 'COMPLETED', 'POS/ICICI/TXN88192', 'ICICI Coral Visa Card', CURRENT_TIMESTAMP - INTERVAL '1 days', CURRENT_TIMESTAMP - INTERVAL '1 days'),
(206, 201, 206, 51328.82, 'UPI', 'COMPLETED', 'UPI/2026/APEX99128301', 'Paytm UPI Payment', CURRENT_TIMESTAMP - INTERVAL '5 hours', CURRENT_TIMESTAMP - INTERVAL '5 hours')
ON CONFLICT (id) DO NOTHING;

-- 2.12 Seed Operational Expenses for Large Business (INR amounts)
INSERT INTO expenses (id, business_id, category, description, amount, payment_method, expense_date, created_by_id, created_at, updated_at)
VALUES
(201, 201, 'Rent', 'Monthly Lease for Whitefield Central Distribution Warehouse', 95000.00, 'NET_BANKING', CURRENT_DATE - 25, 201, CURRENT_TIMESTAMP - INTERVAL '25 days', CURRENT_TIMESTAMP - INTERVAL '25 days'),
(202, 201, 'Rent', 'Commercial Lease - Indiranagar Flagship Retail Showroom', 180000.00, 'NET_BANKING', CURRENT_DATE - 24, 201, CURRENT_TIMESTAMP - INTERVAL '24 days', CURRENT_TIMESTAMP - INTERVAL '24 days'),
(203, 201, 'Logistics', 'Inter-branch Secured Freight & BlueDart Express Delivery', 18500.00, 'NET_BANKING', CURRENT_DATE - 18, 202, CURRENT_TIMESTAMP - INTERVAL '18 days', CURRENT_TIMESTAMP - INTERVAL '18 days'),
(204, 201, 'Utilities', 'High-Tension Commercial Electricity & High-speed Fiber Internet', 24800.00, 'NET_BANKING', CURRENT_DATE - 15, 201, CURRENT_TIMESTAMP - INTERVAL '15 days', CURRENT_TIMESTAMP - INTERVAL '15 days'),
(205, 201, 'Payroll', 'Monthly Floor Staff & Store Associates Advance Payroll', 165000.00, 'NET_BANKING', CURRENT_DATE - 10, 201, CURRENT_TIMESTAMP - INTERVAL '10 days', CURRENT_TIMESTAMP - INTERVAL '10 days'),
(206, 201, 'Maintenance', 'Store HVAC Central Cooling Maintenance & CCTV Security AMC', 14500.00, 'CARD', CURRENT_DATE - 4, 202, CURRENT_TIMESTAMP - INTERVAL '4 days', CURRENT_TIMESTAMP - INTERVAL '4 days'),
(207, 201, 'Marketing', 'Bengaluru Metro Digital Display Ads & Social Campaign', 45000.00, 'NET_BANKING', CURRENT_DATE - 2, 201, CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

-- 2.13 Seed Reviews for Large Business
INSERT INTO reviews (id, business_id, rating, feedback_text, customer_name, customer_contact, is_positive, redirected_to_public_platform, is_hidden, moderation_notes, created_at, updated_at)
VALUES
(201, 201, 5, 'Bought the Dell XPS 13 and 4K monitor. Incredible showroom, demo units, and instant invoice with GST credit!', 'Vikramaditya Rao', 'vikram.rao@enterprise.com', true, true, false, 'Corporate verified', CURRENT_TIMESTAMP - INTERVAL '11 days', CURRENT_TIMESTAMP - INTERVAL '11 days'),
(202, 201, 5, 'Cleanest electronics store in Bangalore. Knowledgeable staff and instant unboxing demo.', 'Meera Nambiar', 'meera.nambiar@creativestudio.in', true, true, false, 'Shared to Google', CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP - INTERVAL '7 days'),
(203, 201, 5, 'Got genuine boAt earphones and GaN fast charger. Fast billing counter and smooth UPI payment.', 'Karthik Subramanian', 'karthik.sub@gmail.com', true, true, false, NULL, CURRENT_TIMESTAMP - INTERVAL '4 days', CURRENT_TIMESTAMP - INTERVAL '4 days'),
(204, 201, 4, 'Wide selection of keyboards and mice. Would appreciate even more mechanical switch options.', 'Rohit Malhotra', 'rohit.malhotra@fintech.io', true, true, false, NULL, CURRENT_TIMESTAMP - INTERVAL '1 days', CURRENT_TIMESTAMP - INTERVAL '1 days')
ON CONFLICT (id) DO NOTHING;

-- Reset Sequences to prevent ID collision for future inserts
SELECT setval(pg_get_serial_sequence('businesses', 'id'), GREATEST((SELECT MAX(id) FROM businesses), 300));
SELECT setval(pg_get_serial_sequence('users', 'id'), GREATEST((SELECT MAX(id) FROM users), 300));
SELECT setval(pg_get_serial_sequence('categories', 'id'), GREATEST((SELECT MAX(id) FROM categories), 300));
SELECT setval(pg_get_serial_sequence('products', 'id'), GREATEST((SELECT MAX(id) FROM products), 300));
SELECT setval(pg_get_serial_sequence('customers', 'id'), GREATEST((SELECT MAX(id) FROM customers), 300));
SELECT setval(pg_get_serial_sequence('orders', 'id'), GREATEST((SELECT MAX(id) FROM orders), 300));
SELECT setval(pg_get_serial_sequence('order_items', 'id'), GREATEST((SELECT MAX(id) FROM order_items), 300));
SELECT setval(pg_get_serial_sequence('payments', 'id'), GREATEST((SELECT MAX(id) FROM payments), 300));
SELECT setval(pg_get_serial_sequence('expenses', 'id'), GREATEST((SELECT MAX(id) FROM expenses), 300));
SELECT setval(pg_get_serial_sequence('reviews', 'id'), GREATEST((SELECT MAX(id) FROM reviews), 300));
SELECT setval(pg_get_serial_sequence('locations', 'id'), GREATEST((SELECT MAX(id) FROM locations), 300));
SELECT setval(pg_get_serial_sequence('suppliers', 'id'), GREATEST((SELECT MAX(id) FROM suppliers), 300));
SELECT setval(pg_get_serial_sequence('purchases', 'id'), GREATEST((SELECT MAX(id) FROM purchases), 300));
SELECT setval(pg_get_serial_sequence('purchase_items', 'id'), GREATEST((SELECT MAX(id) FROM purchase_items), 300));
SELECT setval(pg_get_serial_sequence('location_inventories', 'id'), GREATEST((SELECT MAX(id) FROM location_inventories), 300));
SELECT setval(pg_get_serial_sequence('stock_movements', 'id'), GREATEST((SELECT MAX(id) FROM stock_movements), 300));
