# Job Portal Backend API

## Overview

This is the backend API for a job portal application focused on tutoring opportunities. Built with Node.js, Express, and MongoDB.

## Features

- User authentication (Tutors and Recruiters)
- Tution center management
- Tutor opportunity posting and management
- Application management
- File uploads (Cloudinary integration)
- JWT-based authentication
- Input validation and error handling

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT
- **File Storage:** Cloudinary
- **Validation:** Custom validation utils

## API Endpoints

### User Routes (`/api/user`)

- `POST /register` - User registration
- `POST /login` - User login
- `POST /logout` - User logout
- `POST /profile/update` - Update user profile
- `GET /:id` - Get user by ID

### Tution Center Routes (`/api/tution-center`)

- `POST /register` - Create tution center
- `GET /get` - Get user's tution centers
- `GET /get/:id` - Get specific tution center
- `PUT /update/:id` - Update tution center
- `DELETE /:id` - Delete tution center

### Tutor Opportunity Routes (`/api/tutor-opportunity`)

- `GET /get` - Get all opportunities
- `POST /post` - Create new opportunity
- `GET /getadminopportunities` - Get admin opportunities
- `GET /get/:id` - Get specific opportunity
- `DELETE /:id` - Delete opportunity

### Application Routes (`/api/application`)

- `POST /apply/:id` - Apply for opportunity
- `GET /get` - Get user's applications
- `GET /:id/applicants` - Get applicants for opportunity
- `POST /status/:id/update` - Update application status

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Environment Variables:**
   Copy `.env.example` to `.env` and fill in your values:

   ```
   PORT=5011
   MONGO_URI=mongodb://localhost:27017/job-portal
   JWT_SECRET=your-secret-key
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   FRONTEND_URL=http://localhost:5173
   ```

3. **Run the server:**
   ```bash
   npm run dev
   ```

## Project Structure

```
Backend/
├── controllers/     # Route handlers
├── models/         # Database schemas
├── routes/         # API routes
├── middleware/     # Custom middleware
├── utils/          # Utility functions
├── index.js        # Main server file
└── package.json
```

## Database Models

- **User:** User accounts (tutors and recruiters)
- **TutionCenter:** Tution center information
- **TutorOpportunity:** Job postings
- **Application:** Job applications

## Authentication

- JWT tokens stored in HTTP-only cookies
- Role-based access control (Tutor/Recruiter)
- Protected routes with authentication middleware

## Error Handling

- Centralized error handling middleware
- Input validation with custom validators
- Proper HTTP status codes and error messages
