# Backend Integration Guide

## Required API Endpoints

### 1. Register User
```
POST /api/auth/register
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "password": "Password123",
  "name": "John Doe",
  "hobbies": ["history", "culture"],
  "languages": ["en", "es"],
  "country": "US"
}

Response (200/201):
{
  "success": true,
  "user": { /* User object */ },
  "token": "jwt_token_here"
}

Error Response (400/409):
{
  "success": false,
  "error": "Error message"
}
```

**Controller Expectations:**
- Hash password with bcrypt before storing
- Validate email format and uniqueness
- Store hobbies, languages, country as arrays/columns
- Return JWT token for immediate login

---

### 2. Login
```
POST /api/auth/login
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "password": "Password123"
}

Response (200):
{
  "success": true,
  "user": { /* User object */ },
  "token": "jwt_token_here"
}

Error Response (401):
{
  "success": false,
  "error": "Invalid email or password"
}
```

---

### 3. Get Current User
```
GET /api/auth/me
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "user": { /* User object */ }
}
```

---

### 4. Logout
```
POST /api/auth/logout
Authorization: Bearer <token>

Response (200):
{
  "success": true
}
```

---

## User Data Structure (Return This)

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  hobbies: string[];      // e.g., ["history", "culture"]
  languages: string[];    // e.g., ["en", "es"]
  country: string;        // e.g., "US"
  visited: string[];      // country codes visited
  profileImage?: string;
  dateOfRegister: string; // ISO timestamp
  dateOfLastSignin?: string; // ISO timestamp
  role: string;          // e.g., "USER", "ADMIN"
  
  // ⚠️ NEVER return password field
}
```

---

## Quick Setup

1. In `.env.local`:
set
VITE_API_URL=http://localhost:8080/api
VITE_USE_MOCK=false


2. Backend returns exact User structure above
3. Use JWT tokens in `Authorization: Bearer <token>` header
4. Hash passwords with bcrypt before storing
5. Return all arrays (hobbies, languages, visited) as JSON arrays

---

**That's it!** Implement these 4 endpoints with the structure above.
