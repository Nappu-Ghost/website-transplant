# Azure Lagoon Resort Website

Modern resort website and booking platform with guest-facing pages, a complete reservation flow, and admin operations.

## What The Website Includes

- Public pages for homepage, accommodations, activities, map, contact, and services
- Booking flow with room and activity selection, guest details, and payments
- Authentication and role-based access (customer, manager, admin)
- Admin area for managing listings, bookings, and operational data

## Tech Stack

- Frontend: Next.js (App Router), React, TypeScript, Tailwind CSS, Shadcn/ui
- Backend: FastAPI, SQLAlchemy
- Database: SQLite

## Run The Website Locally

### 1) Frontend

From `resort-new`:

```bash
npm install
npm run dev
```

Frontend runs on: http://localhost:3000

### 2) Backend

From `resort-new/backend`:

```bash
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

Backend runs on: http://localhost:8001

### API Docs

- Swagger UI: http://localhost:8001/docs
- ReDoc: http://localhost:8001/redoc

## Seed Database Setup

The seed script creates a complete sample dataset for development, including users, hotels, rooms, activities, bookings, and payments.

From `resort-new/backend`:

```bash
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python seed.py
```

Notes:

- This uses `backend/resort.db` (SQLite).
- Running `seed.py` resets existing app data first, then inserts fresh sample data.
- Use this only in development.

## Seeded Login Credentials

These credentials are defined in `backend/seed.py`.

| Role | Email | Password |
| :--- | :---- | :------- |
| Demo Customer | demo.user@example.com | `Riv3r!Stone#2026` |
| Admin | admin.user@example.com | `Gl0w!Maple@7261` |
| Manager | manager.user@example.com | `C0balt!Harbor#5512` |
| Customer | maya.rivera@example.com | `Saffr0n!Lagoon#8402` |
| Customer | noah.bennett@example.com | `C0ral!Drift#5731` |
| Customer | ava.chen@example.com | `Palm!Voyage#4628` |

## Roles

- CUSTOMER: browse, book, and manage personal bookings
- MANAGER: manage inventory and booking operations
- ADMIN: full access to administration features
