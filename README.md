# ARS Fashion World 👗✨

An E-Commerce web application for fashion retail with a Customer Frontend, Admin Management Dashboard, and a Node.js/Express REST API backend with MySQL.

---

## 📁 Project Structure

```
ars_fashion_world/
├── admin/                     # Admin Dashboard (React + Vite)
├── backend/                   # Backend Server (Node.js, Express, MySQL)
│   ├── config/                # DB & app configs
│   ├── controllers/           # Route controllers
│   ├── middleware/            # Auth & file upload middlewares
│   ├── models/                # Database models
│   ├── routes/                # Express API routes
│   └── uploads/               # Product & asset images
├── frontend/                  # Customer Storefront (React)
├── databse_ars_fashion.sql    # MySQL database schema & initial data
├── .gitignore                 # Git ignore rules
└── README.md                  # Project documentation
```

---

## 🛠️ Tech Stack

- **Frontend (Storefront):** React 19, React Router v7, React Icons, Swiper, Axios, React Toastify, Recharts
- **Admin Dashboard:** React 19, Vite, Chart.js, Recharts, Lucide Icons, React Router v7, jsPDF
- **Backend:** Node.js, Express 5, MySQL2, Sequelize, JWT Authentication, Multer, Nodemailer, Razorpay
- **Database:** MySQL

---

## 🚀 Getting Started

### 1. Database Setup
1. Open your MySQL client (e.g., MySQL Workbench, phpMyAdmin, or CLI).
2. Create the database:
   ```sql
   CREATE DATABASE databse_ars_fashion;
   ```
3. Import `databse_ars_fashion.sql` into `databse_ars_fashion`.

---

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Update your MySQL credentials, JWT secret, Razorpay keys, and email credentials in `.env`.
4. Start the backend server:
   ```bash
   npm run dev
   # Runs on http://localhost:7000
   ```

---

### 3. Admin Dashboard Setup
1. Navigate to the admin directory:
   ```bash
   cd admin
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
4. Start the development server:
   ```bash
   npm run dev
   # Runs on http://localhost:5173
   ```

---

### 4. Frontend Storefront Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
4. Start the React application:
   ```bash
   npm start
   # Runs on http://localhost:3000
   ```

---

## 🔒 Security Note
Never commit `.env` files containing sensitive credentials (database passwords, API keys, mail credentials) to version control. Always use `.env.example` templates for configuration.
