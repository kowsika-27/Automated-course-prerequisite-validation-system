# Quick Start Guide - Course Prerequisite Validation System

## Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn

## Step 1: Install Backend Dependencies
```bash
cd backend
npm install
```

## Step 2: Configure Backend
1. Open `backend/.env` and update:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string (e.g., generate with `openssl rand -base64 32`)
   - `PORT`: 5000 (default)

2. Make sure MongoDB is running

## Step 3: Start Backend Server
```bash
cd backend
npm run dev
```
Backend will start on `http://localhost:5000`

## Step 4: Install Frontend Dependencies
```bash
cd frontend
npm install
```

## Step 5: Start React Frontend
```bash
cd frontend
npm start
```
Frontend will open on `http://localhost:3000`

## Test the Application

### Admin Workflow
1. **Register** as Admin:
   - Name: Admin User
   - Email: admin@example.com
   - Password: admin123
   - Role: Admin

2. **Login** with admin credentials

3. **Create Courses**:
   - Go to "Manage Courses"
   - Add courses like: C Programming, Data Structures, DBMS

4. **Set Prerequisites**:
   - Go to "Set Prerequisites"
   - Example: DBMS requires C Programming and Data Structures

5. **View Reports**:
   - Go to Reports menu
   - View course-wise eligibility status

### Student Workflow
1. **Register** as Student:
   - Name: Student Name
   - Email: student@example.com
   - Password: student123
   - Role: Student

2. **Login** with student credentials

3. **Add Completed Courses**:
   - Go to "Add Completed Courses"
   - Add courses you've completed (e.g., C Programming)

4. **Check Eligibility**:
   - Go to "Check Eligibility"
   - Select a course to check
   - System will show if you're eligible or what's missing

5. **View History**:
   - View your past eligibility checks

## Project Structure

### Backend Modules
1. **Authentication Module** - Login/Register for admin and students
2. **Course Management** - Add, read, update, delete courses
3. **Prerequisite Management** - Set course prerequisites
4. **Student Course Management** - Track completed courses
5. **Validation Module** - Check student eligibility
6. **Report Module** - Admin reports and analytics

### Frontend Pages
1. **Login Page** - Authentication for both roles
2. **Admin Dashboard** - Course and prerequisite management
3. **Student Dashboard** - Add courses and check eligibility
4. **Reports Page** - Admin analytics and reports

## Important Endpoints

### For Testing with Postman/cURL

#### Register
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "admin123",
  "role": "admin"
}
```

#### Login
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

#### Add Course (Admin, requires token)
```bash
POST http://localhost:5000/api/courses
Content-Type: application/json
Authorization: Bearer <token>

{
  "courseId": "CS101",
  "courseName": "Introduction to Programming",
  "description": "Basic programming concepts",
  "credits": 3
}
```

## Troubleshooting

### Backend won't start
- Check if MongoDB is running
- Verify MONGODB_URI in .env file
- Check if port 5000 is available

### Frontend won't connect to backend
- Ensure backend is running on port 5000
- Check CORS settings in backend/server.js
- Clear browser cache and restart frontend

### MongoDB connection error
- Ensure MongoDB service is running
- Check connection string format
- Verify database credentials if using Atlas

## Support
For issues or questions, refer to the main README.md file
