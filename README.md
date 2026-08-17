# LocalMarket — Store Rating & Business Intelligence Platform

A full-stack web application for rating local stores, managing business analytics, and handling role-based access for Admins, Store Owners, and Normal Users.

## 📁 Project Structure

```
local_market/
├── frontend/        # React + Vite frontend application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── context/      # Auth and Toast context providers
│   │   ├── pages/        # Page-level components (Admin, Owner, User views)
│   │   ├── services/     # API service layer (axios)
│   │   └── utils/        # Form validators and helpers
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/         # Node.js + Express REST API server
│   ├── db/
│   │   ├── index.js      # PostgreSQL connection pool
│   │   ├── schema.sql    # Database schema
│   │   ├── migrate.js    # Run schema migrations
│   │   └── seed.js       # Seed database with sample data
│   ├── middleware/
│   │   ├── auth.js       # JWT authentication middleware
│   │   └── roles.js      # Role-based access control (RBAC)
│   ├── routes/
│   │   ├── auth.js       # Login, register routes
│   │   ├── admin.js      # Admin-only routes
│   │   ├── stores.js     # Store listing and rating routes
│   │   └── owner.js      # Store owner routes
│   ├── utils/
│   │   └── validators.js # Input validation helpers
│   ├── index.js          # Express app entry point
│   └── package.json
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL database

### 1. Backend Setup
```bash
cd backend
npm install
# Copy and configure your environment variables
cp .env.example .env   # edit DATABASE_URL and JWT_SECRET
# Run database migrations and seed
node db/migrate.js
node db/seed.js
# Start the API server (port 5000)
npm start
```

### 2. Frontend Setup
```bash
cd frontend
npm install
# Start the dev server (port 3000)
npm run dev
```

## 🔐 User Roles
| Role | Permissions |
|------|-------------|
| **Admin** | Manage all users, stores, and view platform analytics |
| **Store Owner** | View own store ratings, analytics, and customer reviews |
| **Normal User** | Browse stores, submit and modify ratings |

## 🛠️ Tech Stack
- **Frontend**: React 18, Vite, React Router DOM, Axios, Recharts, Lucide Icons
- **Backend**: Node.js, Express, PostgreSQL (pg), JWT, bcryptjs
- **Database**: PostgreSQL
