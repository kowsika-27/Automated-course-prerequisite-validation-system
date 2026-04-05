# Course Prerequisite Validation System

## Overview
This is a full-stack MERN (MongoDB, Express.js, React.js, Node.js) web application that provides an automated course prerequisite validation system. The system checks whether a student is eligible to enroll in a course by verifying if the required prerequisite courses are completed.

## Features
- **User Authentication**: Secure login for Admin and Student roles
- **Course Management**: Admin can create, read, update, and delete courses
- **Prerequisite Management**: Admin can set and manage prerequisite relationships between courses
- **Student Course Tracking**: Students can add courses they have already completed
- **Eligibility Validation**: Automatic checking of student eligibility for courses
- **Reporting**: Admin can view detailed reports on student eligibility

## Project Structure

### Backend (Node.js + Express)
```
backend/
├── models/
│   ├── User.js
│   ├── Course.js
│   ├── Prerequisite.js
│   ├── StudentCourse.js
│   └── EligibilityLog.js
├── controllers/
│   ├── authController.js
│   ├── courseController.js
│   ├── prerequisiteController.js
│   ├── studentCourseController.js
│   ├── validationController.js
│   └── reportController.js
├── routes/
│   ├── authRoutes.js
│   ├── courseRoutes.js
│   ├── prerequisiteRoutes.js
│   ├── studentCourseRoutes.js
│   ├── validationRoutes.js
│   └── reportRoutes.js
├── middleware/
│   └── auth.js
├── server.js
├── package.json
└── .env
```

### Frontend (React)
```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── pages/
│   │   ├── LoginPage.js
│   │   ├── AdminDashboard.js
│   │   ├── StudentDashboard.js
│   │   └── ReportsPage.js
│   ├── services/
│   │   └── api.js
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
└── package.json
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or on Atlas)
- npm or yarn

### Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   MONGODB_URI=mongodb://localhost:27017/course-prerequisite-db
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   NODE_ENV=development
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```
   The server will run on `http://localhost:5000`

### Frontend Setup
1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm start
   ```
   The application will open on `http://localhost:3000`

## Usage

### Admin Features
1. **Login**: Access with admin credentials
2. **Add Courses**: Create new courses with course ID, name, description, and credits
3. **Set Prerequisites**: Define prerequisite relationships between courses
4. **View Reports**: 
   - Course-wise eligibility report
   - List of eligible and not eligible students for specific courses
   - All eligibility check logs

### Student Features
1. **Login**: Access with student credentials
2. **Add Completed Courses**: Add courses you have already completed
3. **Check Eligibility**: Check if you are eligible for any course based on prerequisites
4. **View History**: See your past eligibility check history

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (requires auth)

### Courses
- `POST /api/courses` - Add new course (Admin only)
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course by ID
- `PUT /api/courses/:id` - Update course (Admin only)
- `DELETE /api/courses/:id` - Delete course (Admin only)

### Prerequisites
- `POST /api/prerequisites` - Set prerequisite (Admin only)
- `GET /api/prerequisites` - Get all prerequisites
- `GET /api/prerequisites/course/:courseId` - Get prerequisites for a course
- `DELETE /api/prerequisites/:id` - Delete prerequisite (Admin only)

### Student Courses
- `POST /api/student-courses` - Add completed course
- `GET /api/student-courses` - Get student's completed courses
- `DELETE /api/student-courses/:id` - Remove completed course

### Validation
- `POST /api/validation/check` - Check eligibility for a course
- `GET /api/validation/history` - Get eligibility check history

### Reports (Admin only)
- `GET /api/reports/eligible/:courseId` - Get eligible students for a course
- `GET /api/reports/not-eligible/:courseId` - Get not eligible students for a course
- `GET /api/reports/course-report/all` - Get course-wise eligibility report
- `GET /api/reports/logs/all` - Get all eligibility logs

## Database Collections

### users
```json
{
  "name": "String",
  "email": "String (unique)",
  "password": "String (hashed)",
  "role": "admin | student",
  "createdAt": "Date"
}
```

### courses
```json
{
  "courseId": "String (unique)",
  "courseName": "String",
  "description": "String",
  "credits": "Number",
  "createdBy": "ObjectId (ref: User)",
  "createdAt": "Date"
}
```

### prerequisites
```json
{
  "courseId": "ObjectId (ref: Course)",
  "prerequisiteCourseId": "ObjectId (ref: Course)",
  "createdBy": "ObjectId (ref: User)",
  "createdAt": "Date"
}
```

### student_courses
```json
{
  "studentId": "ObjectId (ref: User)",
  "courseId": "ObjectId (ref: Course)",
  "completedDate": "Date"
}
```

### eligibility_log
```json
{
  "studentId": "ObjectId (ref: User)",
  "courseId": "ObjectId (ref: Course)",
  "isEligible": "Boolean",
  "missingPrerequisites": "[ObjectId (ref: Course)]",
  "checkDate": "Date"
}
```

## Future Enhancements
- Credit limit checking
- Seat availability management
- Advisor approval workflow
- Timetable clash detection
- Email notifications
- Student transcript generation

## License
ISC
