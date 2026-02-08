# Resort Website Transplant - Migration Mapping

Date: 2026-02-08

This document maps resort-old (donor) to resort-new (host) and describes what to reuse, adapt, or rebuild while keeping resort-new's architecture.

## 1) Resort-old Deep Dive

### 1.1 Pages and Routes (App Router)

Source: [resort-old/src/app](resort-old/src/app)

- / -> Home hero, featured attractions, news/events [resort-old/src/app/page.tsx](resort-old/src/app/page.tsx)
- /about -> history, mission, sustainability, team [resort-old/src/app/about/page.tsx](resort-old/src/app/about/page.tsx)
- /accommodations -> hotel list, room list, filters, video hero [resort-old/src/app/accommodations/page.tsx](resort-old/src/app/accommodations/page.tsx)
- /activities -> activity list, type filter, premium badges [resort-old/src/app/activities/page.tsx](resort-old/src/app/activities/page.tsx)
- /booking -> multi-step booking flow with payment [resort-old/src/app/booking/page.tsx](resort-old/src/app/booking/page.tsx)
- /contact -> contact form + FAQ + map [resort-old/src/app/contact/page.tsx](resort-old/src/app/contact/page.tsx)
- /login -> login/register, profile image upload [resort-old/src/app/login/page.tsx](resort-old/src/app/login/page.tsx)
- /my-bookings -> user booking history, status badges [resort-old/src/app/my-bookings/page.tsx](resort-old/src/app/my-bookings/page.tsx)

Admin routes:
- /admin -> admin dashboard (stats, charts, recent bookings) [resort-old/src/app/admin/page.tsx](resort-old/src/app/admin/page.tsx)
- /admin/bookings -> booking management [resort-old/src/app/admin/bookings/page.tsx](resort-old/src/app/admin/bookings/page.tsx)
- /admin/content -> hotel/room/activity content management [resort-old/src/app/admin/content/page.tsx](resort-old/src/app/admin/content/page.tsx)
- /admin/revenue -> revenue analytics [resort-old/src/app/admin/revenue/page.tsx](resort-old/src/app/admin/revenue/page.tsx)
- /admin/settings -> admin settings panels [resort-old/src/app/admin/settings/page.tsx](resort-old/src/app/admin/settings/page.tsx)
- /admin/users -> user management [resort-old/src/app/admin/users/page.tsx](resort-old/src/app/admin/users/page.tsx)

Layout and auth:
- Global layout, layout wrapper, Toast notifications [resort-old/src/app/layout.tsx](resort-old/src/app/layout.tsx)
- Auth context (localStorage user) [resort-old/src/context/AuthContext.tsx](resort-old/src/context/AuthContext.tsx)

### 1.2 Components and Purposes

Top-level components:
- Site layout (navbar + footer) [resort-old/src/components/Layout.tsx](resort-old/src/components/Layout.tsx)
- Navbar with auth/profile dropdown and mobile menu [resort-old/src/components/Navbar.tsx](resort-old/src/components/Navbar.tsx)
- Booking: hotel selector [resort-old/src/components/HotelSelection.tsx](resort-old/src/components/HotelSelection.tsx)
- Booking: room selector with filters and capacity [resort-old/src/components/RoomSelection.tsx](resort-old/src/components/RoomSelection.tsx)
- Booking: ferry tickets selector [resort-old/src/components/FerryTickets.tsx](resort-old/src/components/FerryTickets.tsx)
- Booking: payment form with card preview and animation [resort-old/src/components/Payment.tsx](resort-old/src/components/Payment.tsx)

Booking flow components:
- Stepper indicator [resort-old/src/components/booking/BookingSteps.tsx](resort-old/src/components/booking/BookingSteps.tsx)
- Guest info form [resort-old/src/components/booking/BookingInfo.tsx](resort-old/src/components/booking/BookingInfo.tsx)
- Date range selector [resort-old/src/components/booking/DateSelector.tsx](resort-old/src/components/booking/DateSelector.tsx)
- Premium plan marketing card [resort-old/src/components/booking/PremiumPlanCard.tsx](resort-old/src/components/booking/PremiumPlanCard.tsx)
- Activities selector by category [resort-old/src/components/booking/ActivitiesSelection.tsx](resort-old/src/components/booking/ActivitiesSelection.tsx)
- Review summary [resort-old/src/components/booking/BookingReview.tsx](resort-old/src/components/booking/BookingReview.tsx)
- Confirmation receipt [resort-old/src/components/booking/BookingConfirmation.tsx](resort-old/src/components/booking/BookingConfirmation.tsx)

Admin components:
- Admin sidebar navigation [resort-old/src/components/admin/AdminSidebar.tsx](resort-old/src/components/admin/AdminSidebar.tsx)
- Admin theme provider (dark, glass variables) [resort-old/src/components/admin/ThemeProvider.tsx](resort-old/src/components/admin/ThemeProvider.tsx)
- Activity modal (CRUD form) [resort-old/src/components/admin/ActivityModal.tsx](resort-old/src/components/admin/ActivityModal.tsx)
- Hotel modal (CRUD form) [resort-old/src/components/admin/HotelModal.tsx](resort-old/src/components/admin/HotelModal.tsx)
- Room modal (CRUD form, room image selection) [resort-old/src/components/admin/RoomModal.tsx](resort-old/src/components/admin/RoomModal.tsx)
- Multi-room bulk creation modal [resort-old/src/components/admin/MultipleRoomsModal.tsx](resort-old/src/components/admin/MultipleRoomsModal.tsx)
- User create/edit/delete modals [resort-old/src/components/admin/AddUserModal.tsx](resort-old/src/components/admin/AddUserModal.tsx), [resort-old/src/components/admin/EditUserModal.tsx](resort-old/src/components/admin/EditUserModal.tsx), [resort-old/src/components/admin/DeleteConfirmationModal.tsx](resort-old/src/components/admin/DeleteConfirmationModal.tsx)

Admin booking UI:
- Booking list components [resort-old/src/components/admin/bookings/BookingsList.tsx](resort-old/src/components/admin/bookings/BookingsList.tsx)
- Booking filters [resort-old/src/components/admin/bookings/BookingFilters.tsx](resort-old/src/components/admin/bookings/BookingFilters.tsx)
- Booking actions and badges [resort-old/src/components/admin/bookings/BookingActions.tsx](resort-old/src/components/admin/bookings/BookingActions.tsx), [resort-old/src/components/admin/bookings/BookingStatusBadge.tsx](resort-old/src/components/admin/bookings/BookingStatusBadge.tsx), [resort-old/src/components/admin/bookings/BookingServiceBadge.tsx](resort-old/src/components/admin/bookings/BookingServiceBadge.tsx)
- Booking accordion [resort-old/src/components/admin/bookings/BookingAccordion.tsx](resort-old/src/components/admin/bookings/BookingAccordion.tsx)
- Booking types [resort-old/src/components/admin/bookings/types.ts](resort-old/src/components/admin/bookings/types.ts)

### 1.3 Features and Functionality

- Public marketing pages (home, about, contact)
- Accommodations browsing (hotel list + room list)
- Activities browsing (filters, premium badges)
- Full booking flow (multi-step, premium plan, multiple rooms, ferry tickets, payment, confirmation)
- User auth (register/login via Next API, stored in localStorage)
- My bookings history with status filters
- Admin dashboard with stats and charts
- Admin content CRUD (hotels, rooms, activities)
- Admin booking management (status updates, filters)
- Revenue analytics
- Admin user management

### 1.4 Data Models (Prisma)

Source: [resort-old/prisma/schema.prisma](resort-old/prisma/schema.prisma)

- User: id, email, password, name, role, profileImage, timestamps
- Hotel: id, name, description, location, imageUrl, floors, timestamps
- Room: id, hotelId, name, type, price, capacity, description, imageUrl, floorNumber, available, isPremium, timestamps
- Activity: id, name, activityType, price, capacity, imageUrl, isPremium, timestamps
- Event: id, name, startDate, endDate, isPremium, timestamps
- Booking: id, userId, numberOfGuests, status, totalPrice, startDate, endDate, isPremium, timestamps
- BookingRoom: bookingId, roomId (unique pair)
- BookingActivity: bookingId, activityId (unique pair)
- FerryTickets: bookingId, numberOfTickets, price, timestamps
- BookingStatus enum: PENDING, PAYMENT_COMPLETED, CONFIRMED, CHECKED_IN, CHECKED_OUT, CANCELLED

### 1.5 API Endpoints (Next API)

Source: [resort-old/src/app/api](resort-old/src/app/api)

Auth and users:
- POST /api/auth (login/register) [resort-old/src/app/api/auth/route.ts](resort-old/src/app/api/auth/route.ts)
- GET, POST /api/users [resort-old/src/app/api/users/route.ts](resort-old/src/app/api/users/route.ts)
- GET, PUT, DELETE /api/users/[id] [resort-old/src/app/api/users/[id]/route.ts](resort-old/src/app/api/users/[id]/route.ts)

Bookings and booking-related:
- GET, POST, PUT, DELETE /api/bookings [resort-old/src/app/api/bookings/route.ts](resort-old/src/app/api/bookings/route.ts)
- GET /api/bookings/user?userId= [resort-old/src/app/api/bookings/user/route.ts](resort-old/src/app/api/bookings/user/route.ts)
- POST, GET /api/ferry-tickets [resort-old/src/app/api/ferry-tickets/route.ts](resort-old/src/app/api/ferry-tickets/route.ts)

Accommodations and activities:
- GET, POST, PUT, DELETE /api/hotels [resort-old/src/app/api/hotels/route.ts](resort-old/src/app/api/hotels/route.ts)
- GET, POST, PUT, DELETE /api/rooms [resort-old/src/app/api/rooms/route.ts](resort-old/src/app/api/rooms/route.ts)
- POST /api/rooms/bulk [resort-old/src/app/api/rooms/bulk/route.ts](resort-old/src/app/api/rooms/bulk/route.ts)
- GET, POST, PUT, DELETE /api/activities [resort-old/src/app/api/activities/route.ts](resort-old/src/app/api/activities/route.ts)
- GET /api/attractions (empty stub) [resort-old/src/app/api/attractions/route.ts](resort-old/src/app/api/attractions/route.ts)
- GET, POST, PUT, DELETE /api/events [resort-old/src/app/api/events/route.ts](resort-old/src/app/api/events/route.ts)
- GET, PUT, DELETE /api/events/[id] [resort-old/src/app/api/events/[id]/route.ts](resort-old/src/app/api/events/[id]/route.ts)

Transport:
- GET, POST, PUT, DELETE /api/ferries [resort-old/src/app/api/ferries/route.ts](resort-old/src/app/api/ferries/route.ts)
- GET, POST, PUT, DELETE /api/ferry-schedules [resort-old/src/app/api/ferry-schedules/route.ts](resort-old/src/app/api/ferry-schedules/route.ts)

Images and assets:
- GET /api/images/activities [resort-old/src/app/api/images/activities/route.ts](resort-old/src/app/api/images/activities/route.ts)
- GET /api/images/hotels [resort-old/src/app/api/images/hotels/route.ts](resort-old/src/app/api/images/hotels/route.ts)
- GET /api/images/rooms [resort-old/src/app/api/images/rooms/route.ts](resort-old/src/app/api/images/rooms/route.ts)

Admin analytics:
- GET /api/revenue [resort-old/src/app/api/revenue/route.ts](resort-old/src/app/api/revenue/route.ts)
- GET /api/dashboard/stats [resort-old/src/app/api/dashboard/stats/route.ts](resort-old/src/app/api/dashboard/stats/route.ts)
- GET /api/dashboard/recent-bookings [resort-old/src/app/api/dashboard/recent-bookings/route.ts](resort-old/src/app/api/dashboard/recent-bookings/route.ts)
- GET /api/dashboard/activity [resort-old/src/app/api/dashboard/activity/route.ts](resort-old/src/app/api/dashboard/activity/route.ts)

Contact:
- POST /api/contact [resort-old/src/app/api/contact/route.ts](resort-old/src/app/api/contact/route.ts)

### 1.6 Assets (Public)

Source: [resort-old/public](resort-old/public)

Top-level files:
- Videos: accommodations.mp4, home.mp4
- Images: activities.jpg, mainresort.jpg, testimage.jpg
- Icons: file.svg, globe.svg, offline.svg, profile.svg, window.svg, next.svg, vercel.svg

Content library:
- Activities icons (SVG) [resort-old/public/content/activities](resort-old/public/content/activities)
- Hotels images (JPG) [resort-old/public/content/hotels](resort-old/public/content/hotels)
- Rooms images (JPG) [resort-old/public/content/rooms](resort-old/public/content/rooms)

## 2) Resort-new Deep Dive

### 2.1 Routing and Layout

Source: [resort-new/src/app](resort-new/src/app)

Public pages:
- / -> dental marketing landing page [resort-new/src/app/page.tsx](resort-new/src/app/page.tsx)
- /clinics -> clinic list [resort-new/src/app/clinics/page.tsx](resort-new/src/app/clinics/page.tsx)
- /services -> service list [resort-new/src/app/services/page.tsx](resort-new/src/app/services/page.tsx)
- /book-appointment -> booking form [resort-new/src/app/book-appointment/page.tsx](resort-new/src/app/book-appointment/page.tsx)
- /login -> login/register [resort-new/src/app/login/page.tsx](resort-new/src/app/login/page.tsx)

Admin pages:
- /admin/dashboard [resort-new/src/app/admin/dashboard/page.tsx](resort-new/src/app/admin/dashboard/page.tsx)
- /admin/appointments [resort-new/src/app/admin/appointments/page.tsx](resort-new/src/app/admin/appointments/page.tsx)
- /admin/doctors [resort-new/src/app/admin/doctors/page.tsx](resort-new/src/app/admin/doctors/page.tsx)
- /admin/clinics [resort-new/src/app/admin/clinics/page.tsx](resort-new/src/app/admin/clinics/page.tsx)
- /admin/services [resort-new/src/app/admin/services/page.tsx](resort-new/src/app/admin/services/page.tsx)
- /admin/users [resort-new/src/app/admin/users/page.tsx](resort-new/src/app/admin/users/page.tsx)
- /admin/roster/view [resort-new/src/app/admin/roster/view/page.tsx](resort-new/src/app/admin/roster/view/page.tsx)
- /admin/roster/manage [resort-new/src/app/admin/roster/manage/page.tsx](resort-new/src/app/admin/roster/manage/page.tsx)
- /admin/roster/surgery-rooms [resort-new/src/app/admin/roster/surgery-rooms/page.tsx](resort-new/src/app/admin/roster/surgery-rooms/page.tsx)
- /admin/reports/appointments [resort-new/src/app/admin/reports/appointments/page.tsx](resort-new/src/app/admin/reports/appointments/page.tsx)
- /admin/reports/revenue [resort-new/src/app/admin/reports/revenue/page.tsx](resort-new/src/app/admin/reports/revenue/page.tsx)
- /admin/reports/popularity [resort-new/src/app/admin/reports/popularity/page.tsx](resort-new/src/app/admin/reports/popularity/page.tsx)

Layout:
- Root layout with providers, motion, theming [resort-new/src/app/layout.tsx](resort-new/src/app/layout.tsx)
- Admin layout uses Shadcn Sidebar and role-based nav [resort-new/src/app/admin/layout.tsx](resort-new/src/app/admin/layout.tsx)

### 2.2 Component Architecture and Shadcn/ui Usage

Core app shell:
- App header (nav + auth actions) [resort-new/src/components/app-header.tsx](resort-new/src/components/app-header.tsx)
- App footer (brand + legal links) [resort-new/src/components/app-footer.tsx](resort-new/src/components/app-footer.tsx)
- Theme toggle [resort-new/src/components/theme-toggle-button.tsx](resort-new/src/components/theme-toggle-button.tsx)

Providers:
- Auth provider wrapper [resort-new/src/components/providers/auth-provider.tsx](resort-new/src/components/providers/auth-provider.tsx)
- Theme and motion providers [resort-new/src/components/providers](resort-new/src/components/providers)

Shadcn/ui components used throughout pages:
- Buttons, cards, dialogs, forms, inputs, selects, tabs, calendar, toasts, sidebar
- Core library in [resort-new/src/components/ui](resort-new/src/components/ui)

### 2.3 FastAPI Backend Structure

Entry points and routing:
- FastAPI app, router registration [resort-new/backend/app/main.py](resort-new/backend/app/main.py)
- Routers: users, auth, clinics, doctors, services, appointments, shifts, surgery bookings [resort-new/backend/app/routers](resort-new/backend/app/routers)

Models and schemas:
- SQLAlchemy models [resort-new/backend/app/models.py](resort-new/backend/app/models.py)
- Pydantic schemas [resort-new/backend/app/schemas.py](resort-new/backend/app/schemas.py)

### 2.4 Authentication Flow

- Client auth storage (token + user in localStorage) [resort-new/src/lib/auth.ts](resort-new/src/lib/auth.ts)
- Auth context for login/register/logout [resort-new/src/hooks/auth/useAuth.tsx](resort-new/src/hooks/auth/useAuth.tsx)
- Next API auth routes (login/register/logout/check-session/restore-session) [resort-new/src/app/api/auth](resort-new/src/app/api/auth)
- Middleware guards admin and booking routes using user_session cookie [resort-new/src/middleware.ts](resort-new/src/middleware.ts)

### 2.5 State Management and Data Fetching

- API wrapper targets FastAPI at NEXT_PUBLIC_API_URL [resort-new/src/lib/api.ts](resort-new/src/lib/api.ts)
- Pages currently use useEffect + fetch instead of TanStack Query
- TanStack Query is listed in project goals but not implemented in runtime code

### 2.6 Public Assets

Source: [resort-new/public](resort-new/public)

- Clinic images [resort-new/public/images/clinics](resort-new/public/images/clinics)
- Icon set [resort-new/public/images/icons](resort-new/public/images/icons)

## 3) Migration Mapping (Resort-old -> Resort-new)

### 3.1 Pages Mapping

- / (Home): replace dental landing with resort hero, attractions, events. Target [resort-new/src/app/page.tsx](resort-new/src/app/page.tsx)
- /about: create page and content from resort-old about. Target to add [resort-new/src/app/about/page.tsx](resort-new/src/app/about/page.tsx)
- /accommodations: create page from resort-old accommodations. Target to add [resort-new/src/app/accommodations/page.tsx](resort-new/src/app/accommodations/page.tsx)
- /activities: create page from resort-old activities. Target to add [resort-new/src/app/activities/page.tsx](resort-new/src/app/activities/page.tsx)
- /booking: replace /book-appointment with resort booking flow. Target to add [resort-new/src/app/booking/page.tsx](resort-new/src/app/booking/page.tsx), remove or repurpose [resort-new/src/app/book-appointment/page.tsx](resort-new/src/app/book-appointment/page.tsx)
- /contact: add resort contact page. Target to add [resort-new/src/app/contact/page.tsx](resort-new/src/app/contact/page.tsx)
- /my-bookings: add user booking history. Target to add [resort-new/src/app/my-bookings/page.tsx](resort-new/src/app/my-bookings/page.tsx)
- /login: adapt existing login/register to resort copy. Target [resort-new/src/app/login/page.tsx](resort-new/src/app/login/page.tsx)

Admin mapping:
- /admin/dashboard: replace dental stats with resort booking, occupancy, revenue. Target [resort-new/src/app/admin/dashboard/page.tsx](resort-new/src/app/admin/dashboard/page.tsx)
- /admin/appointments -> /admin/bookings (new): replace dental appointments with resort bookings
- /admin/clinics -> /admin/accommodations (new): replace clinics with hotels/rooms
- /admin/services -> /admin/activities (new): replace dental services with resort activities
- /admin/users: reuse for resort users
- /admin/reports/*: adapt to resort revenue/booking activity
- /admin/roster/*: replace or remove if not needed for resort

### 3.2 Components Mapping

Reusable from resort-new (adapt copy only):
- App shell: [resort-new/src/components/app-header.tsx](resort-new/src/components/app-header.tsx), [resort-new/src/components/app-footer.tsx](resort-new/src/components/app-footer.tsx)
- Admin shell: [resort-new/src/app/admin/layout.tsx](resort-new/src/app/admin/layout.tsx)
- Shadcn/ui components: [resort-new/src/components/ui](resort-new/src/components/ui)

Resort-old components to adapt (rewrite with Shadcn/ui + types):
- Booking flow components [resort-old/src/components/booking](resort-old/src/components/booking)
- Booking selection components [resort-old/src/components/HotelSelection.tsx](resort-old/src/components/HotelSelection.tsx), [resort-old/src/components/RoomSelection.tsx](resort-old/src/components/RoomSelection.tsx), [resort-old/src/components/FerryTickets.tsx](resort-old/src/components/FerryTickets.tsx), [resort-old/src/components/Payment.tsx](resort-old/src/components/Payment.tsx)
- Admin content modals [resort-old/src/components/admin](resort-old/src/components/admin)
- Admin booking list components [resort-old/src/components/admin/bookings](resort-old/src/components/admin/bookings)

Replace or remove (dental-specific):
- /clinics, /services, /appointments UI and related components in resort-new
- Dental icons from [resort-new/public/images/icons](resort-new/public/images/icons) if not used for resort branding

### 3.3 Data Model Mapping (Prisma -> SQLAlchemy)

Current SQLAlchemy models in resort-new are dental-oriented [resort-new/backend/app/models.py](resort-new/backend/app/models.py). Proposed resort equivalents:

- User -> User
  - Keep: id, name, email, password hash, role, status, createdAt, updatedAt
  - Add: profileImage (from resort-old)
  - Roles: CUSTOMER, ADMIN, MANAGER (drop dental roles if unused)

- Hotel -> Accommodation or Hotel
  - Fields: id, name, description, location, imageUrl, floors, createdAt, updatedAt

- Room -> Room
  - Fields: id, hotelId, name, type, price, capacity, description, imageUrl, floorNumber, available, isPremium

- Activity -> Activity
  - Fields: id, name, activityType, price, capacity, imageUrl, isPremium

- Event -> Event
  - Fields: id, name, startDate, endDate, isPremium

- Booking -> Booking
  - Fields: id, userId, numberOfGuests, status, totalPrice, startDate, endDate, isPremium

- BookingRoom -> BookingRoom (join table)
  - Fields: id, bookingId, roomId

- BookingActivity -> BookingActivity (join table)
  - Fields: id, bookingId, activityId

- FerryTickets -> TransportTicket or FerryTicket
  - Fields: id, bookingId, numberOfTickets, price

- Ferry / FerrySchedule -> Transport or FerrySchedule (optional)
  - Use only if ferry scheduling remains a feature

### 3.4 API Route Mapping (Old -> New)

Old Next API routes should be re-implemented as FastAPI endpoints under /api/v1, then proxied via Next API routes in resort-new/src/app/api.

Suggested FastAPI routes for resort:
- POST /api/v1/auth/login, POST /api/v1/auth/register
- GET/POST/PUT/DELETE /api/v1/users
- GET/POST/PUT/DELETE /api/v1/accommodations
- GET/POST/PUT/DELETE /api/v1/rooms
- POST /api/v1/rooms/bulk
- GET/POST/PUT/DELETE /api/v1/activities
- GET/POST/PUT/DELETE /api/v1/bookings
- GET /api/v1/bookings/user
- GET/POST/PUT/DELETE /api/v1/events
- GET/POST/PUT/DELETE /api/v1/ferries
- GET/POST/PUT/DELETE /api/v1/ferry-schedules
- GET/POST /api/v1/ferry-tickets
- GET /api/v1/revenue
- GET /api/v1/dashboard/stats, /api/v1/dashboard/recent-bookings, /api/v1/dashboard/activity
- POST /api/v1/contact

Next API route mapping (resort-new/src/app/api) should mirror these paths so frontend can keep using /api/*.

### 3.5 Reusable Components and Assets

From resort-new (reuse as base):
- App shell (header/footer), sidebar, theme toggle
- Shadcn/ui components and layout patterns
- Auth provider + middleware guard logic

From resort-old (adapt and restyle with Shadcn/ui):
- Booking flow components and user journey
- Admin booking list and filters
- Content management modals for hotels/rooms/activities
- Resort-specific assets in [resort-old/public/content](resort-old/public/content)

## 4) Gaps and Risks to Address Early

- TanStack Query not used in current resort-new pages; decide if you want to introduce it during migration or keep fetch-based patterns for now.
- Auth uses both localStorage tokens and user_session cookie; ensure consistency when rewriting resort flows.
- Admin role logic in middleware is dental-specific; roles should be simplified for resort.
- Several Next API routes in resort-new (shifts and surgery-bookings GET by ID) are placeholders; not needed for resort but good to remove during cleanup.

## 5) Immediate Next Actions (Phase 2 Prep)

- Decide final FastAPI schema names for accommodations/rooms/activities/bookings.
- Decide whether ferry schedules are required for MVP.
- Confirm route naming for bookings and my-bookings in resort-new app.
- Confirm if payment should be real integration or mocked like resort-old.
