Interview Master – AI Interview Tracker & Job Coach

Interview Master is a full-stack web application designed to help job seekers track applications, analyze resumes with ATS logic, and practice interviews using AI feedback — all in one place.

This project focuses on solving a real problem: keeping your job search organized while actively improving your chances of getting hired.

=> What This App Does

Interview Master helps users:

Track job applications in a clear pipeline

Upload resumes and get ATS match scores

Identify missing keywords from job descriptions

Practice interview questions and receive AI-generated feedback

Measure improvement over time with scores and reports

Think of it as a personal job-search dashboard with an AI coach built in.

=> Key Features
=> Authentication

Secure login using Supabase Auth

Protected routes for user-specific data

=> Job Tracking

Add and manage job applications

Track status (applied, interview, rejected, offer, etc.)

Dashboard overview with totals and progress

=> Resume & ATS Analysis

Upload PDF resume

Extract text from resume

Compare resume against job descriptions

Generate:

ATS match score

Missing keywords

Improvement suggestions

=> Interview Practice (AI)

Generate interview questions

Submit answers

Get:

Score

Feedback

Improved sample answer

=> Analytics & Reports

Average ATS score

Interview performance trends

Weak skill areas based on past attempts

=> Tech Stack
Frontend

React

TypeScript

Tailwind CSS

React Router

Supabase Client

Backend

Node.js

Express

TypeScript

Drizzle ORM

PostgreSQL (Supabase)

Multer (file uploads)

PDF parsing utility

AI & Services

Google Gemini API (for ATS + interview feedback)

Supabase Auth & Database

Deployment

Frontend: Render

Backend: Render

Database: Supabase (PostgreSQL)

=> Project Architecture
frontend/
 ├─ src/
 │  ├─ components/
 │  ├─ pages/
 │  ├─ lib/
 │  │  ├─ api.ts
 │  │  └─ supabase.ts
 │  └─ App.tsx

backend/
 ├─ src/
 │  ├─ routes/
 │  ├─ controllers/
 │  ├─ middleware/
 │  ├─ db/
 │  ├─ utils/
 │  └─ server.ts


Frontend and backend are deployed separately and communicate via REST APIs secured with JWT tokens.

🔑 Environment Variables
Backend (.env)
PORT=5000
DATABASE_URL=your_postgres_url
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key

Frontend (.env)
VITE_API_URL=https://your-backend-url
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

⚙️ Local Setup
1. Clone the repository
git clone https://github.com/Rahuls2642/interview-master.git

2. Install dependencies

Frontend:

cd frontend
npm install
npm run dev


Backend:

cd backend
npm install
npm run dev

3. Configure environment variables

Add .env files for frontend and backend as shown above.

=> Authentication Flow (High Level)

User logs in via Supabase

Frontend retrieves access token

Token is sent in Authorization: Bearer <token> header

Backend middleware verifies token

User data is attached to req.user

This ensures all job, resume, and interview data is private per user.

=> Why This Project Matters

This isn’t a toy CRUD app.

It demonstrates:

Real authentication

File uploads & parsing

AI integration

Protected APIs

Meaningful dashboards

Production deployment

Real-world problem solving

It’s built the way an actual product would be built.

=> Future Improvements

Resume versioning

Job description auto-import

Mock interview voice support

Export reports as PDF

Better ATS weighting logic

=> Author

Rahul
Full-stack developer
Focused on building practical, real-world applications.
