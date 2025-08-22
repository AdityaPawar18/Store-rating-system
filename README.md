# Rating System - Full Stack Application

A comprehensive rating system with role-based access control built with React, Express.js, and PostgreSQL.

## Features

- **Three User Roles**: System Administrator, Normal User, Store Owner
- **Authentication**: JWT-based login/registration system
- **Rating System**: Users can rate stores (1-5 stars)
- **Admin Dashboard**: Complete user and store management
- **Store Management**: Owners can view their ratings and customer feedback
- **Form Validation**: Comprehensive validation according to specifications

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, JWT Authentication
- **Database**: PostgreSQL
- **Validation**: Joi for backend, custom validation for frontend

## Setup Instructions

### 1. Environment Variables

Set up the following environment variables in your deployment:

\`\`\`
DB_USER=your_db_user
DB_HOST=your_db_host
DB_NAME=your_db_name
DB_PASSWORD=your_db_password
DB_PORT=5432
PORT=5000
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret_key
NEXT_PUBLIC_API_URL=http://localhost:5000/api
\`\`\`

### 2. Database Setup

Run the database setup scripts:

\`\`\`bash
npm run setup-db
\`\`\`

This will create all necessary tables and seed initial data.

### 3. Development

To run both frontend and backend simultaneously:

\`\`\`bash
npm run dev:full
\`\`\`

Or run them separately:

\`\`\`bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend  
npm run dev
\`\`\`

## User Roles & Permissions

### System Administrator
- Add new stores, users, and admin users
- View dashboard with statistics
- Manage all users and stores with filtering
- Full CRUD operations

### Normal User
- Register and login
- View and search stores
- Submit and modify ratings
- Update password

### Store Owner
- Login to platform
- View store ratings and customer feedback
- See average rating and statistics
- Update password

## Validation Rules

- **Name**: 20-60 characters
- **Address**: Maximum 400 characters  
- **Password**: 8-16 characters, must include uppercase letter and special character
- **Email**: Standard email validation
- **Ratings**: 1-5 stars only

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile

### Stores
- `GET /api/stores` - List all stores (with search)
- `POST /api/stores` - Create new store (admin only)

### Ratings
- `POST /api/ratings` - Submit rating
- `PUT /api/ratings/:id` - Update rating

### Admin
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/users` - List users with filtering
- `POST /api/admin/users` - Create new user

## Default Users

The system comes with pre-seeded users:

- **Admin**: admin@example.com / Admin123!
- **User**: user@example.com / User123!
- **Store Owner**: store@example.com / Store123!


