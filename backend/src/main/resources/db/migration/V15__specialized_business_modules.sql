-- =============================================================================
-- BizFlow Schema Migration V15
-- Description: Specialized modules for Restaurant, Salon, Electronics, Repair, Education
-- =============================================================================

-- =============================================================================
-- 1. RESTAURANT / CAFE MODULE TABLES
-- =============================================================================
CREATE TABLE IF NOT EXISTS restaurant_tables (
    id BIGSERIAL PRIMARY KEY,
    business_id BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    table_number VARCHAR(50) NOT NULL,
    name VARCHAR(100),
    capacity INT NOT NULL DEFAULT 4,
    section_floor VARCHAR(100) DEFAULT 'Main Dining',
    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    active_order_id BIGINT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_rest_table_biz_num UNIQUE (business_id, table_number),
    CONSTRAINT chk_rest_table_status CHECK (status IN ('AVAILABLE', 'OCCUPIED', 'RESERVED'))
);
CREATE INDEX IF NOT EXISTS idx_rest_tables_biz ON restaurant_tables (business_id);
CREATE INDEX IF NOT EXISTS idx_rest_tables_status ON restaurant_tables (status);

CREATE TABLE IF NOT EXISTS restaurant_orders (
    id BIGSERIAL PRIMARY KEY,
    business_id BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    table_id BIGINT REFERENCES restaurant_tables(id) ON DELETE SET NULL,
    order_number VARCHAR(100) NOT NULL,
    order_type VARCHAR(30) NOT NULL DEFAULT 'DINE_IN',
    customer_name VARCHAR(150),
    customer_phone VARCHAR(50),
    status VARCHAR(30) NOT NULL DEFAULT 'ORDERED',
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_rest_order_type CHECK (order_type IN ('DINE_IN', 'TAKEAWAY')),
    CONSTRAINT chk_rest_order_status CHECK (status IN ('ORDERED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED', 'CANCELLED'))
);
CREATE INDEX IF NOT EXISTS idx_rest_orders_biz ON restaurant_orders (business_id);
CREATE INDEX IF NOT EXISTS idx_rest_orders_table ON restaurant_orders (table_id);
CREATE INDEX IF NOT EXISTS idx_rest_orders_status ON restaurant_orders (status);

CREATE TABLE IF NOT EXISTS restaurant_order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES restaurant_orders(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
    item_name VARCHAR(150) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    total_price NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    kot_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    CONSTRAINT chk_rest_item_kot_status CHECK (kot_status IN ('PENDING', 'PREPARING', 'READY', 'SERVED'))
);
CREATE INDEX IF NOT EXISTS idx_rest_items_order ON restaurant_order_items (order_id);

CREATE TABLE IF NOT EXISTS restaurant_kot_tickets (
    id BIGSERIAL PRIMARY KEY,
    business_id BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    order_id BIGINT NOT NULL REFERENCES restaurant_orders(id) ON DELETE CASCADE,
    kot_number VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_rest_kot_status CHECK (status IN ('PENDING', 'PREPARING', 'READY', 'SERVED'))
);
CREATE INDEX IF NOT EXISTS idx_rest_kot_biz ON restaurant_kot_tickets (business_id);
CREATE INDEX IF NOT EXISTS idx_rest_kot_order ON restaurant_kot_tickets (order_id);

-- =============================================================================
-- 2. SALON / BEAUTY MODULE TABLES
-- =============================================================================
CREATE TABLE IF NOT EXISTS salon_services (
    id BIGSERIAL PRIMARY KEY,
    business_id BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(100) DEFAULT 'Haircare',
    duration_minutes INT NOT NULL DEFAULT 30,
    price NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_salon_services_biz ON salon_services (business_id);

CREATE TABLE IF NOT EXISTS salon_appointments (
    id BIGSERIAL PRIMARY KEY,
    business_id BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    customer_id BIGINT REFERENCES customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(50),
    service_id BIGINT REFERENCES salon_services(id) ON DELETE SET NULL,
    service_name VARCHAR(150) NOT NULL,
    staff_name VARCHAR(150),
    appointment_date DATE NOT NULL,
    start_time VARCHAR(20) NOT NULL,
    end_time VARCHAR(20),
    duration_minutes INT NOT NULL DEFAULT 30,
    price NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'BOOKED',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_salon_appt_status CHECK (status IN ('BOOKED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'))
);
CREATE INDEX IF NOT EXISTS idx_salon_appt_biz ON salon_appointments (business_id);
CREATE INDEX IF NOT EXISTS idx_salon_appt_date ON salon_appointments (appointment_date);
CREATE INDEX IF NOT EXISTS idx_salon_appt_status ON salon_appointments (status);

-- =============================================================================
-- 3. ELECTRONICS & WARRANTY MODULE TABLES
-- =============================================================================
CREATE TABLE IF NOT EXISTS device_serial_items (
    id BIGSERIAL PRIMARY KEY,
    business_id BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(150) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100) NOT NULL,
    imei_number VARCHAR(100),
    customer_name VARCHAR(150),
    customer_phone VARCHAR(50),
    customer_email VARCHAR(150),
    invoice_number VARCHAR(100),
    purchase_date DATE NOT NULL,
    warranty_months INT NOT NULL DEFAULT 12,
    warranty_start_date DATE NOT NULL,
    warranty_expiry_date DATE NOT NULL,
    warranty_status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    warranty_provider VARCHAR(100) DEFAULT 'Brand Manufacturer',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_device_serial_biz UNIQUE (business_id, serial_number),
    CONSTRAINT chk_device_warranty_status CHECK (warranty_status IN ('ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'VOID'))
);
CREATE INDEX IF NOT EXISTS idx_device_serial_biz ON device_serial_items (business_id);
CREATE INDEX IF NOT EXISTS idx_device_serial_num ON device_serial_items (serial_number);
CREATE INDEX IF NOT EXISTS idx_device_imei_num ON device_serial_items (imei_number);
CREATE INDEX IF NOT EXISTS idx_device_warranty_status ON device_serial_items (warranty_status);

-- =============================================================================
-- 4. REPAIR & SERVICE JOB CARDS TABLES
-- =============================================================================
CREATE TABLE IF NOT EXISTS repair_job_cards (
    id BIGSERIAL PRIMARY KEY,
    business_id BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    job_card_number VARCHAR(100) NOT NULL,
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_email VARCHAR(150),
    item_type VARCHAR(100) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    serial_or_imei VARCHAR(100),
    problem_description TEXT NOT NULL,
    diagnostic_notes TEXT,
    work_performed TEXT,
    parts_cost NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    labour_cost NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    total_estimated_cost NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    total_final_cost NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    assigned_technician VARCHAR(150),
    status VARCHAR(30) NOT NULL DEFAULT 'RECEIVED',
    priority VARCHAR(30) NOT NULL DEFAULT 'NORMAL',
    estimated_completion_date DATE,
    delivery_date TIMESTAMP WITH TIME ZONE,
    payment_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_repair_job_num_biz UNIQUE (business_id, job_card_number),
    CONSTRAINT chk_repair_status CHECK (status IN ('RECEIVED', 'DIAGNOSING', 'REPAIRING', 'READY', 'DELIVERED', 'CANCELLED')),
    CONSTRAINT chk_repair_priority CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
    CONSTRAINT chk_repair_payment CHECK (payment_status IN ('PENDING', 'PAID'))
);
CREATE INDEX IF NOT EXISTS idx_repair_job_biz ON repair_job_cards (business_id);
CREATE INDEX IF NOT EXISTS idx_repair_job_num ON repair_job_cards (job_card_number);
CREATE INDEX IF NOT EXISTS idx_repair_job_status ON repair_job_cards (status);
CREATE INDEX IF NOT EXISTS idx_repair_job_customer ON repair_job_cards (customer_phone);

-- =============================================================================
-- 5. EDUCATION & COACHING TABLES
-- =============================================================================
CREATE TABLE IF NOT EXISTS edu_courses (
    id BIGSERIAL PRIMARY KEY,
    business_id BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50),
    duration VARCHAR(100) NOT NULL DEFAULT '6 Months',
    total_fees NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_edu_courses_biz ON edu_courses (business_id);

CREATE TABLE IF NOT EXISTS edu_batches (
    id BIGSERIAL PRIMARY KEY,
    business_id BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    course_id BIGINT NOT NULL REFERENCES edu_courses(id) ON DELETE CASCADE,
    batch_name VARCHAR(150) NOT NULL,
    schedule VARCHAR(150) DEFAULT 'Mon-Fri 10:00 AM - 12:00 PM',
    start_date DATE,
    end_date DATE,
    capacity INT NOT NULL DEFAULT 30,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_edu_batches_biz ON edu_batches (business_id);
CREATE INDEX IF NOT EXISTS idx_edu_batches_course ON edu_batches (course_id);

CREATE TABLE IF NOT EXISTS edu_students (
    id BIGSERIAL PRIMARY KEY,
    business_id BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    student_id_number VARCHAR(100) NOT NULL,
    email VARCHAR(150),
    phone VARCHAR(50) NOT NULL,
    parent_name VARCHAR(150),
    parent_phone VARCHAR(50),
    address TEXT,
    admission_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    current_batch_id BIGINT REFERENCES edu_batches(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_edu_student_id_biz UNIQUE (business_id, student_id_number),
    CONSTRAINT chk_edu_student_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'COMPLETED', 'DROPPED'))
);
CREATE INDEX IF NOT EXISTS idx_edu_students_biz ON edu_students (business_id);
CREATE INDEX IF NOT EXISTS idx_edu_students_batch ON edu_students (current_batch_id);

CREATE TABLE IF NOT EXISTS edu_enrollments (
    id BIGSERIAL PRIMARY KEY,
    business_id BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES edu_students(id) ON DELETE CASCADE,
    batch_id BIGINT NOT NULL REFERENCES edu_batches(id) ON DELETE CASCADE,
    course_id BIGINT NOT NULL REFERENCES edu_courses(id) ON DELETE CASCADE,
    enrollment_date DATE NOT NULL,
    total_fees NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    discount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    net_fees NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    pending_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    next_due_date DATE,
    payment_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_edu_enroll_payment CHECK (payment_status IN ('PAID', 'PARTIAL', 'OVERDUE', 'PENDING'))
);
CREATE INDEX IF NOT EXISTS idx_edu_enroll_biz ON edu_enrollments (business_id);
CREATE INDEX IF NOT EXISTS idx_edu_enroll_student ON edu_enrollments (student_id);
CREATE INDEX IF NOT EXISTS idx_edu_enroll_batch ON edu_enrollments (batch_id);

CREATE TABLE IF NOT EXISTS edu_fee_payments (
    id BIGSERIAL PRIMARY KEY,
    business_id BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    enrollment_id BIGINT NOT NULL REFERENCES edu_enrollments(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES edu_students(id) ON DELETE CASCADE,
    receipt_number VARCHAR(100) NOT NULL,
    amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'CASH',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_edu_fees_biz ON edu_fee_payments (business_id);
CREATE INDEX IF NOT EXISTS idx_edu_fees_enroll ON edu_fee_payments (enrollment_id);

CREATE TABLE IF NOT EXISTS edu_attendances (
    id BIGSERIAL PRIMARY KEY,
    business_id BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    batch_id BIGINT NOT NULL REFERENCES edu_batches(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES edu_students(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PRESENT',
    remarks VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_edu_attendance_rec UNIQUE (batch_id, student_id, attendance_date),
    CONSTRAINT chk_edu_att_status CHECK (status IN ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED'))
);
CREATE INDEX IF NOT EXISTS idx_edu_att_biz ON edu_attendances (business_id);
CREATE INDEX IF NOT EXISTS idx_edu_att_batch_date ON edu_attendances (batch_id, attendance_date);

CREATE TABLE IF NOT EXISTS edu_exam_results (
    id BIGSERIAL PRIMARY KEY,
    business_id BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    batch_id BIGINT NOT NULL REFERENCES edu_batches(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES edu_students(id) ON DELETE CASCADE,
    exam_name VARCHAR(150) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    exam_date DATE NOT NULL,
    max_marks NUMERIC(6,2) NOT NULL DEFAULT 100.00,
    marks_obtained NUMERIC(6,2) NOT NULL DEFAULT 0.00,
    grade VARCHAR(10),
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_edu_exam_biz ON edu_exam_results (business_id);
CREATE INDEX IF NOT EXISTS idx_edu_exam_student ON edu_exam_results (student_id);
