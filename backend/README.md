AyuChain Backend

Backend API for the AyuChain blockchain-based Ayurvedic herb supply-chain platform.

The backend provides authentication, user management, role-based access control, PostgreSQL database integration, herb registration, and herb tracking APIs.

Tech Stack

Node.js

Express.js

PostgreSQL

Neon PostgreSQL

JWT Authentication

bcryptjs

pg

dotenv

CORS

Backend Structure

backend/
├── src/
│   ├── config/
│   │   ├── db.js
│   │   ├── initDb.js
│   │   ├── initHerbDb.js
│   │   ├── initTrackingDb.js
│   │   └── testDb.js
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── herbController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── herbModel.js
│   │   ├── trackingModel.js
│   │   └── userModel.js
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── herbRoutes.js
│   │   └── userRoutes.js
│   └── utils/
│       └── jwt.js
├── .env
├── .gitignore
├── package.json
├── package-lock.json
├── server.js
└── README.md

Installation

From the backend directory:

npm install

Environment Variables

Create a .env file:

PORT=5000
DATABASE_URL=YOUR_NEON_POSTGRESQL_CONNECTION_STRING
JWT_SECRET=YOUR_JWT_SECRET

Never commit .env to GitHub.

Start the Backend

npm run dev

Backend URL:

http://localhost:5000

Test:

GET http://localhost:5000/

Expected response:

{
  "message": "AyuChain Backend API",
  "status": "running"
}

Database

AyuChain uses PostgreSQL hosted on Neon.

Current tables:

users

herbs

herb_tracking

Users

Column

Description

id

Unique user ID

name

User name

email

User email

password

bcrypt hashed password

role

User role

created_at

Account creation time

Herbs

Column

Description

id

Unique herb ID

name

Herb name

description

Herb description

origin

Herb origin

farmer_id

User who registered the herb

status

Current herb status

created_at

Registration time

Herb Tracking

Column

Description

id

Tracking record ID

herb_id

Related herb ID

status

Status recorded for the herb

updated_by

User who updated the status

created_at

Time of status update

User Roles

farmer
collector
laboratory
manufacturer
customer
admin

Role authorization is handled through JWT middleware.

Authentication

Register User

POST /api/auth/register

Request:

{
  "name": "Test Farmer",
  "email": "farmer1@test.com",
  "password": "123456",
  "role": "farmer"
}

Login User

POST /api/auth/login

Request:

{
  "email": "farmer1@test.com",
  "password": "123456"
}

Response:

{
  "message": "Login successful",
  "token": "JWT_TOKEN",
  "user": {
    "id": 1,
    "name": "Test Farmer",
    "email": "farmer1@test.com",
    "role": "farmer"
  }
}

The frontend must save the returned token and send it as a Bearer token when calling protected APIs.

Protected APIs

Protected APIs require:

Authorization: Bearer YOUR_JWT_TOKEN

User Profile

GET /api/users/profile

Authentication: JWT required.

Role-Based Access Control

Admin Dashboard

GET /api/admin/dashboard

Authentication: JWT required.

Allowed role:

admin

Other roles receive:

403 Access denied for this role

Herb APIs

All current herb APIs require JWT authentication.

Register Herb

POST /api/herbs

Request:

{
  "name": "Ashwagandha",
  "description": "Traditional Ayurvedic herb",
  "origin": "Rajasthan"
}

The farmer_id is automatically taken from the authenticated user's JWT.

Get My Herbs

GET /api/herbs/my

Returns herbs registered by the authenticated user.

Get Herb by ID

GET /api/herbs/:id

Example:

GET /api/herbs/1

Update Herb Status

PATCH /api/herbs/:id/status

Authentication: JWT required.

Request:

{
  "status": "laboratory"
}

Example:

PATCH /api/herbs/1/status

Each status update is also recorded in the herb_tracking table.

Example statuses:

registered
collected
laboratory
manufacturing
ready
delivered

Get Herb Tracking History

GET /api/herbs/:id/tracking

Authentication: JWT required.

Example:

GET /api/herbs/1/tracking

Response:

{
  "herb": {
    "id": 1,
    "name": "Ashwagandha",
    "currentStatus": "laboratory"
  },
  "tracking": [
    {
      "status": "collected"
    },
    {
      "status": "laboratory"
    }
  ]
}

The tracking history records status changes and the user responsible for each update.

Frontend Integration

The frontend connects to the backend through HTTP REST APIs.

The basic connection is:

Next.js Frontend
       |
       | HTTP request
       ↓
http://localhost:5000
       |
       ↓
Express Routes
       |
       ↓
Controllers
       |
       ↓
PostgreSQL / Neon

1. Backend Must Be Running

Start the backend first:

cd backend
npm run dev

The backend must be available at:

http://localhost:5000

The frontend does not connect directly to PostgreSQL. The frontend communicates with the Express API, and the backend communicates with PostgreSQL.

2. Frontend API URL

For a Next.js frontend, create:

frontend/.env.local

Add:

NEXT_PUBLIC_API_URL=http://localhost:5000

Restart the Next.js development server after changing .env.local.

3. Create a Reusable API Helper

Create this file in the frontend:

src/lib/api.js

Code:

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function apiRequest(
    endpoint,
    options = {}
) {
    const token =
        typeof window !== "undefined"
            ? localStorage.getItem("token")
            : null;

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(
        `${API_URL}${endpoint}`,
        {
            ...options,
            headers
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "API request failed"
        );
    }

    return data;
}

Now frontend pages can call the backend without repeating the full URL and JWT header.

4. Register User from Frontend

import { apiRequest } from "@/lib/api";

const data = await apiRequest(
    "/api/auth/register",
    {
        method: "POST",
        body: JSON.stringify({
            name: "Test Farmer",
            email: "farmer1@test.com",
            password: "123456",
            role: "farmer"
        })
    }
);

console.log(data);

5. Login from Frontend

import { apiRequest } from "@/lib/api";

const data = await apiRequest(
    "/api/auth/login",
    {
        method: "POST",
        body: JSON.stringify({
            email: "farmer1@test.com",
            password: "123456"
        })
    }
);

localStorage.setItem("token", data.token);
localStorage.setItem(
    "user",
    JSON.stringify(data.user)
);

After login, the token is automatically added to protected API requests by apiRequest().

6. Get Current User

import { apiRequest } from "@/lib/api";

const data = await apiRequest(
    "/api/users/profile"
);

console.log(data.user);

7. Register a Herb

import { apiRequest } from "@/lib/api";

const data = await apiRequest(
    "/api/herbs",
    {
        method: "POST",
        body: JSON.stringify({
            name: "Ashwagandha",
            description: "Traditional Ayurvedic herb",
            origin: "Rajasthan"
        })
    }
);

console.log(data.herb);

The backend automatically gets the authenticated user's ID from the JWT.

8. Get My Herbs

import { apiRequest } from "@/lib/api";

const data = await apiRequest(
    "/api/herbs/my"
);

console.log(data.herbs);

9. Get One Herb

import { apiRequest } from "@/lib/api";

const data = await apiRequest(
    "/api/herbs/1"
);

console.log(data.herb);

10. Update Herb Status

import { apiRequest } from "@/lib/api";

const data = await apiRequest(
    "/api/herbs/1/status",
    {
        method: "PATCH",
        body: JSON.stringify({
            status: "laboratory"
        })
    }
);

console.log(data.herb);

The backend updates the current status and creates a tracking-history record.

11. Get Herb Tracking History

import { apiRequest } from "@/lib/api";

const data = await apiRequest(
    "/api/herbs/1/tracking"
);

console.log(data.tracking);

Example result:

registered
    ↓
collected
    ↓
laboratory

12. Logout

Remove the stored authentication data:

localStorage.removeItem("token");
localStorage.removeItem("user");

Then redirect the user to the login page.

Frontend and Backend Connection Example

A complete login-to-herb flow looks like this:

1. User opens Next.js frontend
          ↓
2. User enters email and password
          ↓
3. Frontend POST /api/auth/login
          ↓
4. Backend verifies password
          ↓
5. Backend returns JWT token
          ↓
6. Frontend stores token
          ↓
7. Frontend sends:
   Authorization: Bearer TOKEN
          ↓
8. Backend JWT middleware verifies token
          ↓
9. Controller processes request
          ↓
10. Model communicates with PostgreSQL
          ↓
11. Backend returns JSON
          ↓
12. Frontend displays the result

CORS

If the frontend and backend run on different ports, the backend must allow the frontend origin through CORS.

Typical local setup:

Frontend: http://localhost:3000
Backend:  http://localhost:5000

The backend should have CORS enabled for the frontend origin.

If the browser reports a CORS error, check the CORS configuration in src/app.js.

Current API Summary

Method

Endpoint

Authentication

Purpose

GET

/

No

Backend status

POST

/api/auth/register

No

Register user

POST

/api/auth/login

No

Login and receive JWT

GET

/api/users/profile

JWT

Get current user

GET

/api/admin/dashboard

JWT + Admin

Admin dashboard

POST

/api/herbs

JWT

Register herb

GET

/api/herbs/my

JWT

Get user's herbs

GET

/api/herbs/:id

JWT

Get herb by ID

PATCH

/api/herbs/:id/status

JWT

Update herb status

GET

/api/herbs/:id/tracking

JWT

Get herb tracking history

Security

Current security features:

JWT authentication

bcrypt password hashing

Role-based access control

Protected API routes

Environment variables for secrets

PostgreSQL parameterized queries

CORS configuration

Backend Architecture

Frontend
   ↓
REST API
   ↓
Routes
   ↓
JWT Middleware
   ↓
Controllers
   ↓
Models
   ↓
PostgreSQL / Neon

Herb tracking flow:

Herb Registration
      ↓
Current Herb Status
      ↓
Status Update API
      ↓
Herb Tracking History
      ↓
Frontend Tracking View

Authentication flow:

Login
  ↓
bcrypt password verification
  ↓
JWT generation
  ↓
Frontend receives token
  ↓
Bearer token
  ↓
JWT middleware
  ↓
Protected API

The README should be updated whenever the current API, database structure, authentication, roles, or frontend integration changes.