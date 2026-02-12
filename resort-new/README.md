# Azure Lagoon Resort: Experience & Booking Platform

> A modern resort experience platform with bookings, activities, and admin operations.

[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Styled with Tailwind](https://img.shields.io/badge/Styled%20with-Tailwind-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
[![Powered by TypeScript](https://img.shields.io/badge/Powered%20by-TypeScript-007ACC?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![FastAPI backend](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![SQLite powered](https://img.shields.io/badge/Database-SQLite-003B57?style=for-the-badge&logo=sqlite)](https://www.sqlite.org)
[![UI with Shadcn](https://img.shields.io/badge/UI-Shadcn-8B5CF6?style=for-the-badge)](https://ui.shadcn.com/)

## What This Is

A resort platform that blends polished marketing pages with a complete booking flow and admin operations. The goal is to deliver a premium resort experience on a modern Next.js + FastAPI stack.

## Highlights

- Curated accommodations and activities
- Booking flow with guest details and payments
- Admin dashboards for managing inventory and bookings
- Secure authentication and role-based access
- Responsive UI built with Shadcn/ui

## Tech Stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- FastAPI + SQLAlchemy
- SQLite
- Shadcn/ui

## Quick Start

### Frontend (Next.js)

```bash
# Install frontend dependencies
npm install

# Run the frontend
npm run dev
```

### Backend (FastAPI + SQLite)

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
.\venv\Scripts\activate  # Windows

# Install backend dependencies
pip install -r requirements.txt

# Initialize the database (if needed)
python init_db.py

# Seed the database with sample data (optional)
python seed_resort_wellness.py

# Run the backend server
python main.py
```

### API Documentation

Once the backend is running, you can access the API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## User Roles

- **Customers (`CUSTOMER`)**
  - Book stays and activities
  - View booking history
  - Manage profile

- **Managers (`MANAGER`)**
  - Manage inventory and bookings
  - View reports and activity metrics

- **Admins (`ADMIN`)**
  - Full system access
  - User and configuration management

## Default Credentials (Seed Data)

| Role     | Email                  | Password   |
| :------- | :--------------------- | :--------- |
| ADMIN    | admin@example.com      | `password` |
| Manager  | manager@example.com    | `password` |
| Officer  | officer@example.com    | `password` |
| Customer | customer@example.com   | `password` |

## Core Entities

- **Users**: Guests and staff accounts
- **Hotels**: Resort properties
- **Rooms**: Accommodation inventory
- **Activities**: Experience offerings
- **Bookings**: Guest reservations
- **Payments**: Booking payments
- **Ferries**: Transfer schedules (optional)

## Development Notes

- Frontend uses Next.js App Router
- Backend exposes REST APIs under /api/v1
- Auth uses JWT and user_session cookie for protected routes
- Admin access is role-restricted
