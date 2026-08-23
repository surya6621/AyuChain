# AyuChain Backend

Backend API for the AyuChain blockchain-based Ayurvedic herb supply-chain platform.

The backend provides authentication, user management, role-based access control, PostgreSQL database integration, and herb registration/tracking APIs.

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Neon PostgreSQL
- JWT Authentication
- bcryptjs
- pg
- dotenv
- CORS

## Backend Structure

```text
backend/
├── src/
│   ├── config/
│   │   ├── db.js
│   │   ├── initDb.js
│   │   ├── initHerbDb.js
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
```

## Installation

From the `backend` directory:

```bash
npm install
```

## Environment Variables

Create a `.env` file:

```env
PORT=5000
DATABASE_URL=YOUR_NEON_POSTGRESQL_CONNECTION_STRING
JWT_SECRET=YOUR_JWT_SECRET
```

Do not commit `.env` to GitHub.

## Start the Backend

```bash
npm run dev
```

Backend URL:

```text
http://localhost:5000
```

Test:

```text
GET http://localhost:5000/
```

Expected response:

```json
{
  "message": "AyuChain Backend API",
  "status": "running"
}
```

## Database

AyuChain uses PostgreSQL hosted on Neon.

Current tables:

- `users`
- `herbs`

### Users

| Column | Description |
|---|---|
| id | Unique user ID |
| name | User name |
| email | User email |
| password | bcrypt hashed password |
| role | User role |
| created_at | Account creation time |

### Herbs

| Column | Description |
|---|---|
| id | Unique herb ID |
| name | Herb name |
| description | Herb description |
| origin | Herb origin |
| farmer_id | User who registered the herb |
| status | Current herb status |
| created_at | Registration time |

## User Roles

```text
farmer
collector
laboratory
manufacturer
customer
admin
```

Role authorization is handled through JWT middleware.

# Authentication

## Register User

**POST** `/api/auth/register`

Request:

```json
{
  "name": "Test Farmer",
  "email": "farmer1@test.com",
  "password": "123456",
  "role": "farmer"
}
```

Response:

```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "Test Farmer",
    "email": "farmer1@test.com",
    "role": "farmer"
  }
}
```

Passwords are hashed using bcrypt before being stored.

## Login User

**POST** `/api/auth/login`

Request:

```json
{
  "email": "farmer1@test.com",
  "password": "123456"
}
```

Response:

```json
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
```

Use the returned JWT token for protected APIs.

# Protected APIs

Protected APIs require:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

## User Profile

**GET** `/api/users/profile`

Authentication: JWT required.

Response:

```json
{
  "user": {
    "id": 1,
    "name": "Test Farmer",
    "email": "farmer1@test.com",
    "role": "farmer"
  }
}
```

# Role-Based Access Control

## Admin Dashboard

**GET** `/api/admin/dashboard`

Authentication: JWT required.

Allowed role:

```text
admin
```

Response:

```json
{
  "message": "Admin dashboard access granted",
  "user": {
    "id": 2,
    "email": "admin@test.com",
    "role": "admin"
  }
}
```

Other roles receive:

```text
403 Access denied for this role
```

# Herb APIs

All current herb APIs require JWT authentication.

## Register Herb

**POST** `/api/herbs`

Request:

```json
{
  "name": "Ashwagandha",
  "description": "Traditional Ayurvedic herb",
  "origin": "Rajasthan"
}
```

Response:

```json
{
  "message": "Herb registered successfully",
  "herb": {
    "id": 1,
    "name": "Ashwagandha",
    "description": "Traditional Ayurvedic herb",
    "origin": "Rajasthan",
    "farmer_id": 1,
    "status": "registered"
  }
}
```

## Get My Herbs

**GET** `/api/herbs/my`

Response:

```json
{
  "herbs": [
    {
      "id": 1,
      "name": "Ashwagandha",
      "description": "Traditional Ayurvedic herb",
      "origin": "Rajasthan",
      "farmer_id": 1,
      "status": "registered"
    }
  ]
}
```

## Get Herb by ID

**GET** `/api/herbs/:id`

Example:

```text
GET /api/herbs/1
```

# Frontend Integration

Local backend URL:

```text
http://localhost:5000
```

## Login

```javascript
const response = await fetch(
    "http://localhost:5000/api/auth/login",
    {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email,
            password
        })
    }
);

const data = await response.json();
const token = data.token;
```

## Protected API

```javascript
const response = await fetch(
    "http://localhost:5000/api/users/profile",
    {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }
);

const data = await response.json();
```

## Register Herb

```javascript
const response = await fetch(
    "http://localhost:5000/api/herbs",
    {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            name: "Ashwagandha",
            description: "Traditional Ayurvedic herb",
            origin: "Rajasthan"
        })
    }
);

const data = await response.json();
```

# Current API Summary

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| GET | `/` | No | Backend status |
| POST | `/api/auth/register` | No | Register user |
| POST | `/api/auth/login` | No | Login and receive JWT |
| GET | `/api/users/profile` | JWT | Get current user |
| GET | `/api/admin/dashboard` | JWT + Admin | Admin dashboard |
| POST | `/api/herbs` | JWT | Register herb |
| GET | `/api/herbs/my` | JWT | Get user's herbs |
| GET | `/api/herbs/:id` | JWT | Get herb by ID |

# Security

Current security features:

- JWT authentication
- bcrypt password hashing
- Role-based access control
- Protected API routes
- Environment variables for secrets
- PostgreSQL parameterized queries
- CORS configuration

# Backend Architecture

```text
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
```

Authentication flow:

```text
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
```

Update this README whenever the current API, database structure, authentication, roles, or frontend integration changes.
