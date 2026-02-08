# 🦷 Island Dental Connect: Smart Dental Management

> Making dental care a breeze across the Maldives! ✨

[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Styled with Tailwind](https://img.shields.io/badge/Styled%20with-Tailwind-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
[![Powered by TypeScript](https://img.shields.io/badge/Powered%20by-TypeScript-007ACC?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![FastAPI backend](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![SQLite powered](https://img.shields.io/badge/Database-SQLite-003B57?style=for-the-badge&logo=sqlite)](https://www.sqlite.org)
[![UI with Shadcn](https://img.shields.io/badge/UI-Shadcn-8B5CF6?style=for-the-badge)](https://ui.shadcn.com/)

## 🌊 What's This All About?

Welcome to the comprehensive dental management system in the Maldives! We're connecting dental care across:
- 🌴 Malé (The Capital)
- 🏖️ Kulhudhufushi (The North Star)
- 🎣 Addu City (The Southern Hub)

## ⭐ Why We're Awesome

```
🦷 Book appointments online with a few clicks
🎯 Find your preferred dentist and clinic easily
💫 Manage your dental care journey seamlessly
🎨 Beautiful, responsive interfaces with dark mode support
📊 Comprehensive analytics for clinic managers
🔒 Secure user authentication and role-based access
```

## 🎮 Features That Make Us Smile

| For Patients 🤗 | For Doctors 🩺 | For Managers/Admin 👔 | For Officers 📋 |
|----------------|---------------|---------------------|----------------|
| Easy booking   | View schedule | Doctor duty roster  | Surgery bookings |
| Price checker  | Patient records | Staff management    | Room management |
| Appointment tracking | Treatment notes | Revenue analytics   | Schedule management |
| Clinic selection | Appointment view | Utilization reports | Doctor roster |
| Service details | Medical history | Multi-clinic management | Booking oversight |

## 🌈 The Cool Gang (Our Stack)

```
🚀 Next.js (App Router) - For modern, optimized frontend
🎨 Tailwind CSS - Responsive and beautiful styling
⚙️ FastAPI (Python) - Fast and secure API backend
🗄️ SQLite Python SQLAlchemy - Efficient data management
🧩 Shadcn/ui - Accessible and customizable UI components
🔒 JWT Authentication - Secure user access control
📊 TanStack React Query - Efficient data fetching and caching
```

## 🎯 Quick Start

### 🚀 Frontend (Next.js)

```bash
# Install frontend dependencies
npm install

# Run the frontend
npm run dev
```

### 🔧 Backend (FastAPI + SQLite)

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
.\venv\Scripts\activate  # on Windows

# Install backend dependencies
pip install -r requirements.txt

# Initialize the database (if needed)
python init_db.py

# Seed the database with sample data (optional)
python seed_dental_clinic.py

# Run the backend server
python main.py
```

### 📡 API Documentation

Once the backend is running, you can access the API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc


## 🎪 User Roles & Permissions

- 🦸‍♂️ **Customers (`CUSTOMER`)**
  - Book and manage appointments
  - View service details and pricing
  - Track appointment history
  - Manage personal profile

- 🧙‍♂️ **Administrative Officers (`ADMINISTRATIVE_OFFICER`)**
  - Manage surgery room bookings and cancellations
  - Handle appointment scheduling
  - Process customer inquiries
  - Oversee day-to-day operations

- 🤹‍♀️ **Managers (`MANAGER`)**
  - Full surgery room management access
  - Update doctor duty rosters
  - Generate comprehensive reports:
    - Appointment utilization
    - Customer visit history
    - Revenue per shift analysis
    - Doctor demand metrics
    - Service popularity reports
  - Add and manage new clinic locations
  - Staff management and oversight

- 🌟 **Admin (`ADMIN`)**
  - All Manager capabilities
  - System-wide configuration
  - User account management
  - Access to all system features
  - Global reporting and analytics

## Default Emails and Passwords
| Role     | Email                  | Password   |
| :------- | :--------------------- | :--------- |
| ADMIN    | admin@example.com      | `password` |
| Manager  | manager@example.com    | `password` |
| Officer  | officer@example.com    | `password` |
| Customer | customer@example.com   | `password` |

## 📚 Key Entities

- **Users**: All system users with role-based authentication
- **Clinics**: Physical dental locations with services and staff
- **Doctors**: Dental professionals with specialties and schedules
- **Services**: Available dental treatments with pricing
- **Appointments**: Customer bookings with status tracking
- **Shifts**: Staff work schedules across locations

## 📝 Development Notes

- Frontend uses Next.js App Router for modern page routing
- Backend implements comprehensive RESTful API with FastAPI
- Database management with SQLite and SQLAlchemy
- Secure authentication with JWT and bcrypt password hashing
- Comprehensive test coverage for API endpoints

## 📜 Project Information

This project is developed for Advanced Software Development (UFCF8S-30-2) course. May 2025.