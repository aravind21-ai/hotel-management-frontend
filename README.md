# Grandview — Hotel Management System

A full-stack, staff-facing hotel management system for managing reservations, rooms, guests, and employee access.

**Live demo:** [hotel-management-frontend-cyan.vercel.app](https://hotel-management-frontend-cyan.vercel.app)
**Backend API:** [github.com/aravind21-ai/hotel-management-system](https://github.com/aravind21-ai/hotel-management-system)

---

## Screenshots

<!-- Add screenshots here -->

![Dashboard](https://github.com/user-attachments/assets/694401a6-bdee-40a6-a4ff-e52f34acf287)
![Rooms](https://github.com/user-attachments/assets/086d87ad-a8d0-41a1-8e18-4ba9ebfc6e1c)
![Reservations](https://github.com/user-attachments/assets/2c606732-d227-496e-b218-3fea6322551f)

---

## Demo Accounts

| Role         | Email                       | Password   |

| Admin        | `admin@hotel.com`           | `admin123` |
| Receptionist | `sarah.reception@hotel.com` | `admin123` |
| Housekeeping | `mike.house@hotel.com`      | `admin123` |

---

## What This Is

Grandview is a staff-facing hotel management system for managing reservations, room status, guest records, and role-based access for hotel employees.

I work front-of-house at a 5-star hotel in Dublin. This started as a way to kill boredom — building something interactive for my workplace, just to learn web design and software development. It's since turned into a full-stack project where I keep finding more real problems from work worth solving, rather than another generic CRUD tutorial app.

The goal was to make the workflows feel realistic, not just technically functional. When a guest checks out, the room doesn't instantly become bookable again — it moves to CLEANING until housekeeping marks it clean. Double-booking is prevented using actual date-range overlap logic rather than simply checking for matching dates.

---

## What It Does

- **Role-based authentication and authorization** — JWT-based login with Admin, Receptionist, and Housekeeping roles. Permissions are enforced both in the frontend and backend; hiding a button is not the only security mechanism.
- **Room management** — Search, filter, and sort rooms, with full CRUD through the UI. Rooms with active or upcoming reservations cannot be deleted.
- **Guest management** — Create and manage guest records, including a guest detail page showing their complete stay history.
- **Reservation management** — Create, update, and cancel reservations with backend date-overlap validation to prevent double bookings.
- **Realistic room lifecycle** — Checking in a guest changes the room to OCCUPIED. Checking out changes it to CLEANING, and a housekeeping action is required before it becomes AVAILABLE again.
- **Atomic state updates** — Check-in and check-out update the reservation and room together in a single transaction, so they can't fall out of sync.
- **Admin staff management** — Admins can create staff accounts, change roles, and deactivate accounts; deactivated accounts are blocked at login.
- **Live dashboard** — Occupancy, room availability, arrivals, departures, and recent activity, all calculated from real database data.
- **Scalable reservation workflow** — Search-as-you-type guest and room selection (built for a hotel with 150+ rooms, not a dropdown you scroll through), plus inline guest creation without leaving the reservation form.

---

## Key Technical Decisions

### Server-side authorization

Authorization doesn't depend on the frontend. Protected API routes require authentication, and role-restricted operations are enforced by backend middleware. A Housekeeping account can't create a reservation by calling the API directly — the button being hidden in the UI isn't the actual security boundary.

### Double-booking prevention

The backend checks for date overlaps before allowing a reservation:

newCheckIn < existingCheckOut
AND
newCheckOut > existingCheckIn

This catches partial overlaps and reservations that fall entirely within an existing booking, not just exact date matches.

### Room lifecycle

Rooms follow an operational workflow:

AVAILABLE → OCCUPIED → CLEANING → AVAILABLE

A room doesn't become available the moment a guest checks out — it has to be marked clean first.

### Atomic check-in and check-out

Check-in and check-out update both the reservation and its associated room inside a single database transaction, so the two can never end up inconsistent with each other.

---

## Architecture

```
┌──────────────────────────────────────┐
│          React + TypeScript          │
│  React Router • Axios • Tailwind CSS │
└──────────────────┬───────────────────┘
                    │ REST API
                    ▼
┌──────────────────────────────────────┐
│   Node.js + Express + TypeScript     │
│      JWT • bcrypt • Prisma ORM       │
└──────────────────┬───────────────────┘
                    │ Prisma
                    ▼
┌──────────────────────────────────────┐
│              PostgreSQL              │
│  User • Guest • Room • Reservation   │
└──────────────────────────────────────┘
```

**Database relationships:** Guest ─────< Reservation >───── Room — a guest can have multiple reservations, and a room can be associated with multiple reservations over time.

---

## Tech Stack

**Frontend:** React, TypeScript, Vite, React Router, Axios, Tailwind CSS
**Backend:** Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, JWT, bcrypt
**Deployment:** Vercel (frontend), Render (backend), Neon (PostgreSQL)

---

## Running Locally

Clone both repositories:

```
git clone https://github.com/aravind21-ai/hotel-management-frontend
git clone https://github.com/aravind21-ai/hotel-management-system
```

**Backend:**

```
cd hotel-management-system
npm install
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

Create a `.env` file:

```
DATABASE_URL="your-postgresql-connection-string"
JWT_SECRET="your-secret"
```

**Frontend:**

```
cd hotel-management-frontend
npm install
npm run dev
```

Create a `.env` file:

```
VITE_API_URL="http://localhost:3000/api"
```

---

## Planned Improvements

The core hotel workflow is complete, but there's more I want to build:

- Dedicated housekeeping task management
- Maintenance request management
- Billing and payment tracking
- A proper audit log, rather than deriving "recent activity" from reservation timestamps
- Refresh-token based authentication
- Automated testing for authentication and reservation logic
- Reservation calendar view
- Reporting and analytics

This started as a way to kill boredom — building something interactive for my workplace, just to learn web design and software development. It's since turned into a full-stack project where I keep finding more real problems from work worth solving. I'm planning to keep building this well past this point — every shift at work tends to surface another workflow worth modeling.

---

## How I Learned This

I had previously been introduced to React and SQL through coursework, but this was my first time building a full-stack application with them. Node.js, Express, Prisma, TypeScript, JWT authentication, and Tailwind CSS were also new to me.

I built this project while learning these technologies, using AI as a learning and problem-solving tool to explore concepts, understand implementation decisions, and work through unfamiliar problems. Building the application gave me a practical way to develop my understanding of full-stack architecture, authentication, database design, API development, and frontend development.