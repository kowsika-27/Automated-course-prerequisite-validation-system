# Development Guide

## Project Setup

### 1. Clone and navigate to the project
```bash
cd fullstack
```

### 2. Backend Development

#### Install Dependencies
```bash
cd backend
npm install
```

#### Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Update `.env` with your configuration:
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: A secure random string for JWT encoding
- `PORT`: Server port (default 5000)
- `NODE_ENV`: development or production

#### Run Backend
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

#### Backend Project Structure
```
backend/
├── models/                 # MongoDB schemas
│   ├── User.js
│   ├── Course.js
│   ├── Prerequisite.js
│   ├── StudentCourse.js
│   └── EligibilityLog.js
├── controllers/           # Business logic
│   ├── authController.js
│   ├── courseController.js
│   ├── prerequisiteController.js
│   ├── studentCourseController.js
│   ├── validationController.js
│   └── reportController.js
├── routes/               # API routes
│   ├── authRoutes.js
│   ├── courseRoutes.js
│   ├── prerequisiteRoutes.js
│   ├── studentCourseRoutes.js
│   ├── validationRoutes.js
│   └── reportRoutes.js
├── middleware/           # Custom middleware
│   └── auth.js           # JWT authentication
├── server.js             # Main server file
├── package.json
└── .env                  # Environment variables
```

### 3. Frontend Development

#### Install Dependencies
```bash
cd frontend
npm install
```

#### Run Frontend
```bash
npm start
```

The application will open on `http://localhost:3000`

#### Frontend Project Structure
```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── pages/
│   │   ├── LoginPage.js          # Login/Register
│   │   ├── LoginPage.css
│   │   ├── AdminDashboard.js     # Admin features
│   │   ├── AdminDashboard.css
│   │   ├── StudentDashboard.js   # Student features
│   │   ├── StudentDashboard.css
│   │   ├── ReportsPage.js        # Admin reports
│   │   └── ReportsPage.css
│   ├── services/
│   │   └── api.js                # API calls
│   ├── App.js                    # Main component
│   ├── App.css
│   ├── index.js
│   └── index.css
└── package.json
```

## Code Organization

### Models
Each model in `backend/models/` defines a MongoDB schema:
- Includes fields, validations, and types
- References to other collections where applicable
- Timestamps for audit trails

### Controllers
Each controller in `backend/controllers/` handles:
- Request validation
- Business logic
- Database operations
- Error handling
- Response formatting

### Routes
Each route file in `backend/routes/` defines:
- HTTP methods (GET, POST, PUT, DELETE)
- Endpoint paths
- Middleware (authentication, authorization)
- Controller method mappings

### Middleware
Authentication middleware in `backend/middleware/auth.js`:
- Verifies JWT tokens
- Extracts user information
- Enforces role-based access control

## Working with the Code

### Adding a New Feature

#### 1. Create the MongoDB Model
```javascript
// backend/models/YourModel.js
const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  // define fields
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('YourModel', schema);
```

#### 2. Create the Controller
```javascript
// backend/controllers/yourController.js
exports.methodName = async (req, res) => {
  try {
    // business logic
    res.json({ message: 'Success' });
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err.message });
  }
};
```

#### 3. Create the Routes
```javascript
// backend/routes/yourRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/yourController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.post('/', authMiddleware, adminMiddleware, controller.methodName);

module.exports = router;
```

#### 4. Add Route to Server
```javascript
// backend/server.js
app.use('/api/your-endpoint', require('./routes/yourRoutes'));
```

#### 5. Create Frontend Component
```javascript
// frontend/src/pages/YourPage.js
import React, { useState, useEffect } from 'react';
import { yourService } from '../services/api';

function YourPage({ user }) {
  // component logic
  return (
    <div>
      {/* UI */}
    </div>
  );
}

export default YourPage;
```

## Testing

### Manual Testing with Postman or cURL

#### Example: Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "student"
  }'
```

#### Example: Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the token from the response and use it in Authorization header:
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer <token>"
```

## Performance Optimization

### Frontend
- Use React.memo() for components that don't need frequent re-renders
- Implement lazy loading for routes
- Optimize API calls with caching
- Minimize bundle size

### Backend
- Index frequently queried fields in MongoDB
- Implement pagination for large datasets
- Use async/await instead of callbacks
- Implement request rate limiting

## Security Best Practices

1. **Environment Variables**: Never commit `.env` file
2. **JWT Secret**: Use a strong, random secret key
3. **Password Hashing**: Always hash passwords with bcryptjs (already implemented)
4. **Authentication**: Verify tokens on protected routes
5. **Authorization**: Check user roles before sensitive operations
6. **Input Validation**: Validate all user inputs
7. **CORS**: Configure CORS properly for production
8. **HTTPS**: Use HTTPS in production

## Debugging

### Backend Debugging
1. Use console.log() for logging
2. Check terminal output for errors
3. Use MongoDB Compass to inspect database
4. Set NODE_ENV=development for detailed logs

### Frontend Debugging
1. Use browser DevTools (F12)
2. Check React Developer Tools extension
3. Use console for JavaScript errors
4. Network tab for API call issues

## Deployment Checklist

- [ ] Update environment variables for production
- [ ] Set JWT_SECRET to a strong value
- [ ] Configure MongoDB URI for production database
- [ ] Set NODE_ENV=production
- [ ] Remove console.log statements
- [ ] Configure CORS for production domain
- [ ] Test all authentication flows
- [ ] Test all API endpoints
- [ ] Optimize database indexes
- [ ] Set up error logging
- [ ] Configure backup strategy

## Common Issues and Solutions

### MongoDB Connection Error
- Ensure MongoDB is running
- Check connection string format
- Verify firewall rules for MongoDB port

### CORS Errors
- Check frontend port (3000) is allowed in backend CORS
- Verify Authorization header format

### JWT Token Errors
- Ensure token is passed correctly in header
- Check token hasn't expired
- Verify JWT_SECRET matches between sessions

### File Upload Issues (if added in future)
- Check upload directory permissions
- Verify file size limits
- Check file type validations
