# BizFlow - Multi-Tenant Business Management SaaS Platform

BizFlow is an enterprise-grade, multi-tenant Business Management and Point-of-Sale (POS) SaaS platform designed for retail shops, restaurants, cafés, bakeries, salons, service enterprises, and multi-branch commercial operations.

---

## 🌟 Key Features

- **Multi-Tenant Architecture**: Strict row-level business data isolation using scoped database queries and tenant context injection.
- **Adaptive Business Sizing**:
  - **Small Businesses**: Streamlined single-register POS, lean inventory tracking, instant receipts, and direct expense recording.
  - **Large / Enterprise Businesses**: Multi-branch & location management, supplier purchase orders, stock ledger movements, and branch-level analytics.
- **Fast POS Billing Terminal**: Barcode scanning, category filters, quick cash/card/UPI tender, automated invoice generation, and tax calculations (inclusive/exclusive).
- **Customer CRM & Ledger**: Customer transaction history, loyalty metrics, total spend tracking, and purchase frequency.
- **Expense & Margin Tracking**: Operating expense categorization (Rent, Payroll, Utilities, Supplies) and net margin analytics.
- **Review Boost Reputation Engine**: Public review landing pages (`/review/:slugOrId`), QR code generation, automated high-rating redirection (Google, Yelp, TripAdvisor), and private feedback collection for lower ratings.
- **AI Business Assistant**: Multi-provider fallback cascade (**Google Gemini** &rarr; **Groq Llama 3.3** &rarr; **OpenRouter**) querying tenant-scoped operational data for insights and forecasting without data leakage or destructive actions.
- **Dedicated Platform Administration**: Super-admin governance portal (`/admin/*`) for global tenant oversight, business activation/suspension, user status management, and platform analytics.

---

## 🏗️ Technology Stack

### Backend
- **Java 17 (LTS)** & **Spring Boot 3.3.x**
- **Spring Security 6** with **Stateless JJWT (JSON Web Token)**
- **Spring Data JPA** with **Hibernate ORM** & **PostgreSQL 15+**
- **Flyway** database migration engine (V1 through V9)
- **Jakarta Validation** (`@Valid`, field-level constraint reporting)
- **SpringDoc OpenAPI 3.0** & **Swagger UI**
- **Apache POI** (Excel) & **iText/PDFBox** (PDF Reporting)
- **Lombok** & **SLF4J / Logback**

### Frontend
- **React 18** with **TypeScript**
- **Vite** next-generation build tool
- **Tailwind CSS** with custom glassmorphism and modern UI tokens
- **React Router v6** with role-based Route Guards (`ProtectedRoute`)
- **Axios** with centralized HTTP interceptors & token refresh handling
- **Lucide React** modern icon suite
- **Recharts** interactive charting library

---

## 📁 Repository Layout

```
BizzFlow/
├── backend/                              # Spring Boot 3 Java Service
│   ├── src/main/java/com/bizflow/
│   │   ├── admin/                        # Platform admin endpoints & metrics
│   │   ├── ai/                           # AI Business Assistant & Multi-Provider Gateway
│   │   ├── analytics/                    # Sales velocity, revenue & expense analytics
│   │   ├── auth/                         # Authentication, signup, login & me endpoints
│   │   ├── billing/                      # POS engine, orders, order items & invoicing
│   │   ├── business/                     # Multi-tenant business entities & settings
│   │   ├── common/                       # ApiResponse, ApiError, BaseEntity, Health API
│   │   ├── config/                       # Security, CORS, OpenAPI, WebMvc configurations
│   │   ├── customer/                     # CRM customer ledger & profiles
│   │   ├── expense/                      # Operational expense tracking & categories
│   │   ├── inventory/                    # Multi-location inventory, suppliers, POs & movements
│   │   ├── notification/                 # Alerting and event notifications
│   │   ├── payment/                      # Offline/Cash, Card, UPI & payment tracking
│   │   ├── product/                      # Product and category catalog
│   │   ├── report/                       # PDF & Excel export generators
│   │   ├── review/                       # Review Boost public pages & feedback
│   │   ├── security/                     # JwtTokenProvider, JwtFilter, UserPrincipal
│   │   └── user/                         # User management & role authorization
│   ├── src/main/resources/
│   │   ├── db/migration/                 # Flyway SQL migrations (V1 to V9)
│   │   └── application.yml               # Centralized Spring Boot configuration
│   └── pom.xml
│
├── frontend/                             # React 18 + TypeScript + Vite SPA
│   ├── src/
│   │   ├── api/                          # Axios instance and API client modules
│   │   ├── components/                   # Reusable UI widgets, layout & modal dialogs
│   │   │   └── layout/                   # AppLayout (Business) & AdminLayout (Platform)
│   │   ├── context/                      # AuthContext & global state providers
│   │   ├── pages/                        # Feature pages (POS, Inventory, AI, Admin, etc.)
│   │   ├── App.tsx                       # Master routing & role guards
│   │   ├── main.tsx                      # Vite React entry point
│   │   └── index.css                     # Tailwind design system tokens
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── .env.example                          # Environment configuration template
├── .gitignore
└── README.md
```

---

## ⚙️ Prerequisites

Ensure you have the following installed on your local development machine:

1. **Java Development Kit (JDK)**: Version **17** or higher (`java -version`)
2. **Apache Maven**: Version **3.9+** (`mvn -version`)
3. **Node.js**: Version **18.x** or **20.x LTS** (`node -v`)
4. **npm**: Version **9.x+** (`npm -v`)
5. **PostgreSQL**: Version **14+** (Recommended: **15+** or **16+**) running on port `5432`

---

## 🚀 Step-by-Step Local Setup

### 1. Database Setup

Open PostgreSQL shell (`psql`) or pgAdmin and create the application database:

```sql
CREATE DATABASE bizflow_db;
```

*(Note: Flyway will automatically execute migrations `V1` through `V9` on backend startup to initialize all tables, foreign keys, unique constraints, and indexes.)*

---

### 2. Configure Environment Variables

Create or update `.env` in the project root or configure backend `application.yml` overrides:

```bash
# Database Configuration
DB_URL=jdbc:postgresql://localhost:5432/bizflow_db
DB_USERNAME=postgres
DB_PASSWORD=postgres

# Server & Security
PORT=8080
JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
JWT_EXPIRATION_MS=86400000
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173

# AI Business Assistant (Optional: Configure any or all for intelligent insights)
BIZFLOW_AI_ENABLED=true
BIZFLOW_AI_GEMINI_API_KEY=your_gemini_api_key_here
BIZFLOW_AI_GROQ_API_KEY=your_groq_api_key_here
BIZFLOW_AI_OPENROUTER_API_KEY=your_openrouter_api_key_here
```

---

### 3. Start the Backend Service

Navigate to the `backend/` directory and run:

```bash
cd backend
mvn clean compile
mvn spring-boot:run
```

The Spring Boot backend will start on **`http://localhost:8080`**.

- **API Base URL**: `http://localhost:8080/api/v1`
- **Health Diagnostic**: `http://localhost:8080/api/v1/health`
- **Swagger UI (Interactive API Docs)**: `http://localhost:8080/swagger-ui/index.html`
- **OpenAPI JSON Specs**: `http://localhost:8080/v3/api-docs`

---

### 4. Start the Frontend Client

In a new terminal window, navigate to the `frontend/` directory and run:

```bash
cd frontend
npm install
npm run dev
```

The React frontend development server will launch at **`http://localhost:5173`**.

---

## 🔑 Default Credentials & Role Accounts

When testing locally, you can use these initial accounts or register a new business via the UI:

| Role | Email | Password | Access Level & Scope |
| :--- | :--- | :--- | :--- |
| **`ADMIN`** | `admin@bizflow.com` | `Admin@123456` | Platform-wide Super Admin (`/admin/*`) |
| **`OWNER`** | `owner@example.com` | `Owner@123456` | Business Proprietor (Full business control) |
| **`STAFF`** | `staff@example.com` | `Staff@123456` | Cashier / Operations (POS, Orders, Inventory) |

*You can also click **"Register Your Business"** on the landing page (`/signup`) to onboard a new business with a custom name, vertical, currency, and tax rate.*

---

## 🧪 Testing & Verification

### Run Backend Unit & Integration Tests

```bash
cd backend
mvn test
```
*Executes all 73 automated tests covering Security, Multi-Tenant Isolation, Billing, Inventory, Review Boost, AI Gateway, Reports, and Admin governance.*

### Run Frontend Production Build Check

```bash
cd frontend
npm run build
```
*Validates full TypeScript typing and compiles an optimized Vite production bundle in `frontend/dist/`.*

---

## 🔒 Security & Production Readiness Highlights

1. **Multi-Tenant Scoping**: All service calls resolve the authenticated tenant via `SecurityUtils.getCurrentBusinessId()`, eliminating Insecure Direct Object References (IDOR).
2. **Encrypted Passwords**: Industry-standard **BCrypt** hashing applied to all credentials.
3. **Stateless JWT**: Standard Bearer authentication tokens signed with HMAC-SHA256.
4. **Information Disclosure Prevention**: `GlobalExceptionHandler` masks unhandled server exceptions into clean `ApiError` envelopes without leaking database structures or internal stack traces.
5. **Robust Transactions**: `@Transactional` boundaries maintain absolute consistency across orders, inventory deductions, stock ledger movements, and purchase receiving.
6. **SQL Injection Defense**: 100% parameterized JPQL and named query bindings via Spring Data JPA.
7. **AI Provider Fallback Cascade**: High-availability AI query execution across Gemini &rarr; Groq &rarr; OpenRouter with zero client-side credential exposure.

---

## 📄 License

This project is licensed under the **MIT License**.
