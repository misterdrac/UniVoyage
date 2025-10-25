# Backend Integration Guide

This guide helps you integrate the frontend authentication system with your backend. Everything you need to know is here!

## 🚀 Quick Start

### 1. Environment Setup
Create a `.env.local` file in the frontend directory:

```bash
# For development (uses mock data)
VITE_USE_MOCK=true

# For production (uses your backend)
VITE_API_URL=http://localhost:8080/api
VITE_USE_MOCK=false
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### 2. Test Your Integration
1. Set `VITE_USE_MOCK=false` and `VITE_API_URL` to your backend URL
2. Restart the frontend: `npm run dev`
3. Try logging in with the test users below

---

## 📋 Required API Endpoints

You need to implement these 5 endpoints:

### 1. User Registration
```
POST /api/auth/register
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}

Success Response (201):
{
  "success": true,
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "profile": {
      "firstName": "",
      "lastName": "",
      "dateOfBirth": "",
      "phoneNumber": "",
      "countryOfResidence": "",
      "profilePicture": null,
      "languages": [],
      "countriesVisited": [],
      "interests": []
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "isActive": true
  },
  "token": "jwt_token_here"
}
```

### 2. User Login
```
POST /api/auth/login
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}

Success Response (200):
{
  "success": true,
  "user": { /* same user object as registration */ },
  "token": "jwt_token_here"
}
```

### 3. Get Current User
```
GET /api/auth/me
Authorization: Bearer jwt_token_here

Success Response (200):
{
  "success": true,
  "user": { /* user object */ }
}
```

### 4. Logout
```
POST /api/auth/logout
Authorization: Bearer jwt_token_here

Success Response (200):
{
  "success": true
}
```

### 5. Google OAuth 
```
GET /api/auth/google
Response: Redirect to Google OAuth

POST /api/auth/google/callback
Content-Type: application/json

Request Body:
{
  "code": "google_oauth_code"
}

Success Response (200):
{
  "success": true,
  "user": { /* user object */ },
  "token": "jwt_token_here"
}
```

---

## 📊 User Data Structure

The frontend expects this exact user structure:

```typescript
interface User {
  id: string;                    // Unique user ID
  email: string;                 // User's email address
  password: string;              // ⚠️ NEVER return this in real API!
  
  profile: {
    firstName: string;           // User's first name
    lastName: string;            // User's last name
    dateOfBirth: string;         // ISO date string (YYYY-MM-DD)
    phoneNumber: string;         // Phone number with country code
    countryOfResidence: string;  // ISO country code (e.g., "US", "CA")
    profilePicture?: string;     // URL to profile picture (optional)
    languages: string[];         // Array of language codes (e.g., ["en", "es"])
    countriesVisited: string[];  // Array of country codes user has visited
    interests: string[];         // Travel interests (e.g., ["history", "culture"])
  };
  
  // System fields
  createdAt: string;             // ISO timestamp when user was created
  lastLoginAt?: string;          // ISO timestamp of last login (optional)
  isActive: boolean;             // Whether user account is active
}
```

### Field Details:
- **countryOfResidence**: Use ISO country codes (US, CA, GB, etc.)
- **languages**: Use ISO language codes (en, es, fr, de, etc.)
- **countriesVisited**: Array of ISO country codes
- **interests**: Travel-related keywords like "history", "culture", "adventure", "party", "nature", "food", "photography"

---

## ❌ Error Handling

All endpoints should return errors in this format:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE"
}
```

### Common Error Codes:
- `INVALID_CREDENTIALS` - Wrong email/password
- `EMAIL_ALREADY_EXISTS` - Email already registered
- `INVALID_EMAIL` - Email format is invalid
- `WEAK_PASSWORD` - Password doesn't meet requirements
- `UNAUTHORIZED` - Invalid or missing token
- `USER_NOT_FOUND` - User doesn't exist
- `ACCOUNT_DISABLED` - User account is disabled

### HTTP Status Codes:
- `200` - Success
- `201` - Created (registration)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid credentials/token)
- `409` - Conflict (email already exists)
- `500` - Internal Server Error

---

## 🔒 Security Requirements

### 1. Password Security
- Hash passwords with bcrypt (minimum 12 rounds)
- Never return passwords in API responses
- Validate password strength (minimum 3 characters for now)

### 2. JWT Tokens
- Include user ID and expiration in token
- Use secure secret key
- Set reasonable expiration (e.g., 7 days)
- Include token in `Authorization: Bearer <token>` header

### 3. Input Validation
- Validate email format: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Validate password length (minimum 3 characters)
- Sanitize all inputs
- Rate limit login attempts

### 4. CORS & Headers
- Allow frontend domain in CORS
- Set appropriate security headers
- Use HTTPS in production

---

## 🧪 Testing

### Test Users (for development)
The frontend comes with these test users:

```javascript
// User 1
Email: john.doe@example.com
Password: Password123

// User 2  
Email: jane.smith@example.com
Password: SecurePass456
```

### Testing Steps:
1. Start your backend server
2. Set `VITE_USE_MOCK=false` in `.env.local`
3. Set `VITE_API_URL` to your backend URL
4. Restart frontend: `npm run dev`
5. Try logging in with test users
6. Test registration with new users
7. Test profile page access

---

## 📁 File Structure Reference

Key frontend files you should know about:

```
frontend/
├── src/
│   ├── data/mockUsers.ts          # Test user data
│   ├── contexts/AuthContext.tsx   # Authentication state management
│   ├── services/api.ts            # API service layer
│   ├── config/api.ts              # API configuration
│   ├── lib/constants.ts           # App constants
│   └── components/auth/           # Login/Signup components
├── BACKEND_INTEGRATION.md         # This file
└── .env.local                     # Environment variables
```

---

## 🔄 How It Works

1. **User Registration/Login**: Frontend sends credentials to your API
2. **Token Storage**: JWT token stored in localStorage
3. **API Calls**: All subsequent requests include `Authorization: Bearer <token>`
4. **User State**: User data managed by React Context
5. **Route Protection**: `/profile` requires authentication

---

## 🆘 Need Help?

### Common Issues:
- **CORS errors**: Make sure your backend allows the frontend domain
- **Token issues**: Check JWT secret and expiration
- **User data mismatch**: Ensure your API returns the exact User structure above
- **Environment variables**: Make sure `.env.local` is configured correctly

### Debug Mode:
- Check browser console for API errors
- Verify network requests in DevTools
- Test API endpoints directly with Postman/curl

---

## 📝 Checklist

Before going live, ensure:
- [ ] All 5 API endpoints implemented
- [ ] User data structure matches exactly
- [ ] Password hashing implemented
- [ ] JWT tokens working
- [ ] CORS configured
- [ ] Error handling implemented
- [ ] Input validation added
- [ ] Rate limiting configured
- [ ] HTTPS enabled (production)
- [ ] Test with frontend integration

---

**That's it!** Your backend should work seamlessly with the frontend once these endpoints are implemented. 🚀