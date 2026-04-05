# API Documentation - Course Prerequisite Validation System

## Base URL
```
http://localhost:5000/api
```

## Authentication Endpoints

### Register User
```
POST /auth/register
Content-Type: application/json

Request Body:
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "password123",
  "role": "admin" | "student"
}

Response:
{
  "message": "User registered successfully"
}
```

### Login User
```
POST /auth/login
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "name": "User Name",
    "email": "user@example.com",
    "role": "admin|student"
  }
}
```

### Get User Profile
```
GET /auth/profile
Authorization: Bearer <token>

Response:
{
  "_id": "user-id",
  "name": "User Name",
  "email": "user@example.com",
  "role": "admin|student",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

## Course Endpoints

### Add Course (Admin Only)
```
POST /courses
Authorization: Bearer <admin-token>
Content-Type: application/json

Request Body:
{
  "courseId": "CS101",
  "courseName": "Introduction to Programming",
  "description": "Learn basic programming concepts",
  "credits": 3
}

Response:
{
  "message": "Course added successfully",
  "course": { ... }
}
```

### Get All Courses
```
GET /courses

Response:
[
  {
    "_id": "course-id",
    "courseId": "CS101",
    "courseName": "Introduction to Programming",
    "description": "Learn basic programming concepts",
    "credits": 3,
    "createdBy": { ... },
    "createdAt": "2024-01-01T00:00:00Z"
  },
  ...
]
```

### Get Course by ID
```
GET /courses/:id

Response:
{
  "_id": "course-id",
  "courseId": "CS101",
  "courseName": "Introduction to Programming",
  "description": "Learn basic programming concepts",
  "credits": 3,
  "createdBy": { ... },
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Update Course (Admin Only)
```
PUT /courses/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

Request Body:
{
  "courseName": "Updated Course Name",
  "description": "Updated description",
  "credits": 4
}

Response:
{
  "message": "Course updated successfully",
  "course": { ... }
}
```

### Delete Course (Admin Only)
```
DELETE /courses/:id
Authorization: Bearer <admin-token>

Response:
{
  "message": "Course deleted successfully"
}
```

## Prerequisite Endpoints

### Set Prerequisite (Admin Only)
```
POST /prerequisites
Authorization: Bearer <admin-token>
Content-Type: application/json

Request Body:
{
  "courseId": "course-id-for-DBMS",
  "prerequisiteCourseId": "course-id-for-C-Programming"
}

Response:
{
  "message": "Prerequisite set successfully",
  "prerequisite": { ... }
}
```

### Get Prerequisites for a Course
```
GET /prerequisites/course/:courseId

Response:
[
  {
    "_id": "prerequisite-id",
    "courseId": {
      "_id": "course-id",
      "courseName": "DBMS",
      "courseId": "CS301"
    },
    "prerequisiteCourseId": {
      "_id": "course-id",
      "courseName": "C Programming",
      "courseId": "CS101"
    },
    "createdAt": "2024-01-01T00:00:00Z"
  },
  ...
]
```

### Get All Prerequisites
```
GET /prerequisites

Response:
[
  { ... },
  ...
]
```

### Delete Prerequisite (Admin Only)
```
DELETE /prerequisites/:id
Authorization: Bearer <admin-token>

Response:
{
  "message": "Prerequisite deleted successfully"
}
```

## Student Course Endpoints

### Add Completed Course
```
POST /student-courses
Authorization: Bearer <student-token>
Content-Type: application/json

Request Body:
{
  "courseId": "course-id"
}

Response:
{
  "message": "Course added successfully",
  "studentCourse": { ... }
}
```

### Get Student's Completed Courses
```
GET /student-courses
Authorization: Bearer <student-token>

Response:
[
  {
    "_id": "student-course-id",
    "studentId": "student-id",
    "courseId": {
      "_id": "course-id",
      "courseId": "CS101",
      "courseName": "Introduction to Programming",
      "description": "...",
      "credits": 3
    },
    "completedDate": "2024-01-01T00:00:00Z"
  },
  ...
]
```

### Get Students who Completed a Course
```
GET /student-courses/course/:courseId

Response:
[
  {
    "_id": "student-course-id",
    "studentId": {
      "_id": "student-id",
      "name": "Student Name",
      "email": "student@example.com"
    },
    "courseId": "course-id",
    "completedDate": "2024-01-01T00:00:00Z"
  },
  ...
]
```

### Remove Completed Course
```
DELETE /student-courses/:id
Authorization: Bearer <student-token>

Response:
{
  "message": "Course removed successfully"
}
```

## Validation Endpoints

### Check Eligibility for a Course
```
POST /validation/check
Authorization: Bearer <student-token>
Content-Type: application/json

Request Body:
{
  "courseId": "course-id"
}

Response:
{
  "isEligible": true,
  "message": "Eligible",
  "missingPrerequisites": []
}

or if not eligible:

{
  "isEligible": false,
  "message": "Not Eligible",
  "missingPrerequisites": [
    {
      "_id": "course-id",
      "courseId": "CS101",
      "courseName": "C Programming"
    },
    ...
  ]
}
```

### Get Eligibility History
```
GET /validation/history
Authorization: Bearer <student-token>

Response:
[
  {
    "_id": "log-id",
    "studentId": "student-id",
    "courseId": {
      "_id": "course-id",
      "courseName": "DBMS"
    },
    "isEligible": true,
    "missingPrerequisites": [],
    "checkDate": "2024-01-01T00:00:00Z"
  },
  ...
]
```

## Report Endpoints (Admin Only)

### Get Eligible Students for a Course
```
GET /reports/eligible/:courseId
Authorization: Bearer <admin-token>

Response:
[
  {
    "_id": "log-id",
    "studentId": {
      "_id": "student-id",
      "name": "Student Name",
      "email": "student@example.com"
    },
    "courseId": "course-id",
    "isEligible": true,
    "checkDate": "2024-01-01T00:00:00Z"
  },
  ...
]
```

### Get Not Eligible Students for a Course
```
GET /reports/not-eligible/:courseId
Authorization: Bearer <admin-token>

Response:
[
  {
    "_id": "log-id",
    "studentId": {
      "_id": "student-id",
      "name": "Student Name",
      "email": "student@example.com"
    },
    "courseId": "course-id",
    "isEligible": false,
    "missingPrerequisites": [
      {
        "_id": "course-id",
        "courseId": "CS101",
        "courseName": "C Programming"
      },
      ...
    ],
    "checkDate": "2024-01-01T00:00:00Z"
  },
  ...
]
```

### Get Course-wise Eligibility Report
```
GET /reports/course-report/all
Authorization: Bearer <admin-token>

Response:
[
  {
    "courseId": "CS301",
    "courseName": "DBMS",
    "eligibleCount": 5,
    "notEligibleCount": 3,
    "totalChecked": 8
  },
  ...
]
```

### Get All Eligibility Logs
```
GET /reports/logs/all
Authorization: Bearer <admin-token>

Response:
[
  {
    "_id": "log-id",
    "studentId": {
      "_id": "student-id",
      "name": "Student Name",
      "email": "student@example.com"
    },
    "courseId": {
      "_id": "course-id",
      "courseId": "CS301",
      "courseName": "DBMS"
    },
    "isEligible": true,
    "missingPrerequisites": [],
    "checkDate": "2024-01-01T00:00:00Z"
  },
  ...
]
```

## Error Responses

All error responses follow this format:

```json
{
  "message": "Error description"
}
```

Common HTTP Status Codes:
- 200: Success
- 400: Bad request
- 401: Unauthorized
- 403: Forbidden (insufficient permissions)
- 404: Not found
- 500: Server error

## Authentication

Include the JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

Replace `<token>` with the token received from the login endpoint.
