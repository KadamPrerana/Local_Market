# LocalMarket — Store Rating & Business Intelligence Platform

A full-stack web application for rating local stores, managing business analytics, and handling role-based access for Admins, Store Owners, and Normal Users.

## 📁 Project Structure

```
local_market/
├── frontend/            # React + Vite frontend application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── context/     # Auth and Toast context providers
│   │   ├── pages/       # Page-level components (Admin, Owner, User)
│   │   ├── services/    # Axios API service layer
│   │   └── utils/       # Validators and helpers
│   ├── index.html
│   ├── vite.config.js
│   ├── .env.example
│   └── package.json
│
├── backend/             # Node.js + Express REST API
│   ├── db/
│   │   ├── index.js     # PostgreSQL connection pool
│   │   ├── schema.sql   # Database schema
│   │   ├── migrate.js   # Run schema migrations
│   │   └── seed.js      # Seed with sample data
│   ├── middleware/
│   │   ├── auth.js      # JWT authentication
│   │   └── roles.js     # Role-based access control (RBAC)
│   ├── routes/
│   │   ├── auth.js      # Login & Register
│   │   ├── admin.js     # Admin-only routes
│   │   ├── stores.js    # Store listing and ratings
│   │   └── owner.js     # Store owner routes
│   ├── utils/
│   │   └── validators.js
│   ├── index.js         # Express entry point
│   ├── .env.example
│   └── package.json
│
├── .env.example         # Root reference for all env vars
├── .gitignore
└── README.md
```

---

## ⚙️ Prerequisites

- **Node.js** v18+
- **PostgreSQL** v14+

---

## 🐘 PostgreSQL Setup

### 1. Install PostgreSQL (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

### 2. Start the PostgreSQL Service
```bash
# Start the service
sudo systemctl start postgresql

# Enable it to start on boot
sudo systemctl enable postgresql

# Check the service status
sudo systemctl status postgresql
```

### 3. Create the Database and User
```bash
# Log in as the postgres superuser
sudo -u postgres psql

# Inside the psql shell, run:
CREATE DATABASE localmarket;
CREATE USER postgres WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE localmarket TO postgres;
\q
```

### 4. Verify Connection
```bash
psql -U postgres -d localmarket -h localhost
# Enter your password when prompted
```

---

## 🚀 Getting Started

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Set up your environment variables
cp .env.example .env
# Edit .env and set your DATABASE_URL, JWT_SECRET

# Example .env content:
# PORT=5000
# DATABASE_URL=postgresql://postgres:your_password@localhost:5432/localmarket
# JWT_SECRET=your_secret_key
# CORS_ORIGIN=http://localhost:3000

# Run database migrations
node db/migrate.js

# Seed the database with sample data
node db/seed.js

# Start the API server (runs on port 5000)
npm start
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# (Optional) Set up environment variables
cp .env.example .env
# Default: VITE_API_URL=http://localhost:5000/api

# Start the dev server (runs on port 3000)
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## 🔐 User Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Manage all users & stores, view platform analytics |
| **Store Owner** | View own store ratings, analytics, and customer reviews |
| **Normal User** | Browse stores, submit and modify ratings |

### Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@localmarket.com | Admin@1234 |
| Store Owner | freshmart.owner@localmarket.com | Owner@1234 |
| Normal User | aarav.sharma.verified@localmarket.com | User@1234 |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, React Router DOM, Axios, Recharts, Lucide Icons |
| **Backend** | Node.js, Express.js, JWT, bcryptjs |
| **Database** | PostgreSQL (via `pg` driver) |
| **Auth** | JSON Web Tokens (JWT) + Role-Based Access Control |

---

## 🔧 Common Issues

### Port already in use (EADDRINUSE)
```bash
# Kill whatever is running on port 5000
lsof -ti:5000 | xargs kill -9
# Then restart: npm start
```

### PostgreSQL connection refused
```bash
# Make sure PostgreSQL is running
sudo systemctl start postgresql
# Then verify your DATABASE_URL in backend/.env
```
