# Store rating system
A comprehensive store rating system with role-based access control built using React, Next.js, Express.js, and PostgreSQL.

✨ Features

🔐 Three User Roles: System Administrator, Normal User, Store Owner
🔑 Authentication: JWT-based login/registration system
⭐ Rating System: Users can rate stores (1–5 stars)
📊 Admin Dashboard: User and store management with analytics
🏪 Store Management: Owners can view ratings and feedback
✅ Form Validation: Robust validation (backend: Joi, frontend: custom rules)

🛠️ Tech Stack

Frontend: Next.js 15, React 19, Tailwind CSS, shadcn/ui
Backend: Express.js, JWT Authentication
Database: PostgreSQL
Validation: Joi (backend), custom validation (frontend)

⚙️ Setup Instructions
1️⃣ Prerequisites

Node.js (v18+)
PostgreSQL (running locally or cloud)
npm or yarn

2️⃣ Environment Variables

Create a .env file in the backend and frontend:
DB_USER=your_db_user  
DB_HOST=your_db_host  
DB_NAME=your_db_name  
DB_PASSWORD=your_db_password  
DB_PORT=5432  
PORT=5000  
FRONTEND_URL=http://localhost:3000  
JWT_SECRET=your_jwt_secret_key  
NEXT_PUBLIC_API_URL=http://localhost:5000/api  

3️⃣ Database Setup

Run setup script:
npm run setup-db
This creates all required tables and seeds initial data.

4️⃣ Development Run

To run both frontend & backend together:
npm run dev:full

Or separately:

# Backend
npm run server  

# Frontend
npm run dev  

👤 User Roles & Permissions
🛡️ System Administrator

Add users and stores (including new admins)
View dashboard with stats
Manage users & stores with full CRUD

👥 Normal User

Register & login
View/search stores
Submit & edit ratings
Update password

🏪 Store Owner

Login
View store ratings & feedback
Track average rating & stats
Update password

✅ Validation Rules

Name: 20–60 characters
Address: Max 400 characters
Password: 8–16 chars, must include uppercase & special character
Email: Standard email format
Ratings: 1–5 stars only

🔗 API Endpoints
🔑 Authentication

POST /api/auth/login → User login
POST /api/auth/register → User registration
GET /api/auth/profile → Get user profile

🏪 Stores

GET /api/stores → List/search stores
POST /api/stores → Create new store (admin only)

⭐ Ratings

POST /api/ratings → Submit rating
PUT /api/ratings/:id → Update rating

🛠️ Admin

GET /api/admin/dashboard → Dashboard statistics
GET /api/admin/users → List users with filtering
POST /api/admin/users → Create new user

👨‍💻 Default Users

Pre-seeded users for testing:

Role	Email	Password
Admin	admin@example.com	Admin123!
User	user@example.com	User123!
Store Owner	store@example.com	Store123!

This project is licensed under the MIT License.
