# Car Dealership Inventory System (TDD Kata)

A full-stack **Car Dealership Inventory Management System** built using Test-Driven Development (TDD) principles. The application features a RESTful Node.js, Express, TypeScript, and SQLite backend paired with a responsive React and Tailwind CSS Single-Page Application (SPA) frontend.

---

## Features

- **User Authentication & Authorization:**
  - Dynamic user registration (`POST /api/auth/register`) and login (`POST /api/auth/login`).
  - Password hashing with `bcrypt` and stateless session authentication using JSON Web Tokens (`JWT`).
  - Role-Based Access Control (RBAC) supporting `Admin` and `User` roles.
- **Vehicle Inventory Management:**
  - View all available vehicles (`GET /api/vehicles`) with live stock counts.
  - Multi-parameter search and filtering (`GET /api/vehicles/search`) by Make, Model, Category, Min Price, and Max Price.
  - Admin-controlled vehicle creation (`POST /api/vehicles`), updating (`PUT /api/vehicles/:id`), and deletion (`DELETE /api/vehicles/:id`).
- **Real-Time Stock Operations:**
  - Customers and Admins can purchase vehicles (`POST /api/vehicles/:id/purchase`), automatically decrementing stock by 1 and disabling the purchase button when stock reaches `0`.
  - Admins can restock inventory (`POST /api/vehicles/:id/restock`).

---

## Tech Stack

- **Backend:** Node.js, Express.js, TypeScript, SQLite3, JSON Web Tokens (`jsonwebtoken`), `bcrypt`
- **Testing:** Jest, `ts-jest`, Supertest
- **Frontend:** React, TypeScript, Tailwind CSS, Axios, HTML5, CSS3

---

## Project Structure

```text
car-dealership-inventory/
├── backend/
│   ├── src/
│   │   ├── app.ts            # Express app, REST API routes, and middleware
│   │   ├── app.spec.ts       # Integration tests for API endpoints
│   │   ├── auth.spec.ts      # Authentication unit/integration tests
│   │   ├── database.ts       # SQLite database connection & schema initialization
│   │   ├── vehicle.ts        # Vehicle model class and business logic
│   │   └── vehicle.spec.ts   # Unit tests for Vehicle model
│   ├── jest.config.js
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── services/api.ts   # Axios instance with JWT interceptor
│   │   ├── App.tsx           # Main SPA interface (Auth + Inventory Dashboard)
│   │   └── index.tsx
│   ├── package.json
│   └── tailwind.config.js
├── PROMPTS.md                # Raw AI chat logs / links
└── README.md                 # Project documentation

git clone <https://github.com/GRATIAN12/car-dealership-inventory.git>
cd car-dealership-inventory