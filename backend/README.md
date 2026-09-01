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

Do not commit .env to GitHub.

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

Use the returned JWT token for protected APIs.

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

Local backend URL:

http://localhost:5000

For protected requests:

const response = await fetch(
    "http://localhost:5000/api/herbs/1/tracking",
    {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }
);

const data = await response.json();

Update herb status:

const response = await fetch(
    "http://localhost:5000/api/herbs/1/status",
    {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            status: "laboratory"
        })
    }
);

const data = await response.json();

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
Routes
   ↓
Middleware
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
