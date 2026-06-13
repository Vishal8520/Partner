# Partner Development Journal

This document records the architectural decisions, technology selections, implementation steps, and rationales for the Partner educational management platform.

---

## 1. Technologies & Choices Rationale

### Database: SQLite & PostgreSQL Dual-Engine
- **Why**: SQLite is perfect for local developer testing, but for production environments like Hugging Face or Docker clouds, we need a robust relational engine. By utilizing SQLAlchemy and checking `DATABASE_URL` environments, we dynamically switch to PostgreSQL when deployed and fallback to SQLite locally.
- **Where**: Backend database integration (`backend/main.py`), using schema migrations on startup.
- **Why SQLAlchemy**: SQLAlchemy ORM allows us to write dialect-agnostic models, facilitating dual support of SQLite and PostgreSQL.

### Google Sign-In & Authentication
- **Why**: Standard passwords require user overhead. Integrating Google OAuth 2.0 simplifies logins. We verify tokens using Google's verification library but fallback to standard base64 decoding for local test flows to ensure developers are never blocked.
- **Where**: `/api/auth/google` in the backend and `LoginPage.jsx` on the client.

### Database Backups
- **Why**: Prevent database loss and allow local archiving.
- **Where**: Sidebar settings page triggering `/api/database/backup`. If SQLite, it downloads the database file directly; if PostgreSQL, it serializes database ORM structures into a downloadable JSON bundle.

### Real-Time Live Transcripts & Recaps
- **Why**: Automated speech transcription records lectures. AI-generated bullet recaps provide immediate revision material.
- **Where**: Connected to WebSockets in `/ws/live-session` and displayed in the **Past Lecture Transcripts** section of `PodPage.jsx` fetching from the database.

---

## 2. Step-by-Step Implementation Record

### Step 1: Initial Database & Audit Configuration
- **Action**: Modified backend config in `main.py` to support PostgreSQL dynamically via `DATABASE_URL` with SQLite fallback. Added the `LoginLog` audit schema and updated the `/api/login` route to record timestamped login metadata (IP address, user agent).

### Step 2: Implement Backend API Endpoints for Attendance & Scheduling
- **Action**: Added model definitions for `Schedule` and custom schemas (`AttendanceSubmitRequest`, `ScheduleCreate`, `ScheduleResponse`, `RescheduleProposeRequest`). Coded FastAPI endpoints for starting an attendance session, submitting class codes, scheduling classes, fetching schedules, proposing reschedules, accepting reschedules, and cancelling sessions.

### Step 3: Implement Highly Automated Attendance Frontend
- **Action**: Modified `StudentInfoPanel.jsx` to add a sub-tab for **Smart Attendance**. The screen features two views:
  - **Teacher View**: Clicking "Generate Code" calls the FastAPI backend to generate a 6-digit verification code with a 60-second animated timer.
  - **Student View**: A form to input their Roll Number and the 6-digit code. Submitting registers their attendance.

### Step 4: Class Scheduler & Rescheduler Frontend
- **Action**: Created `SchedulePage.jsx` featuring a weekly scheduler card feed with glassmorphic cards. Integrated the proposal flow:
  - Teachers can create classes and cancel them, or propose a new date/time.
  - Students see proposed reschedules and can accept them, dynamically updating the database schedule records.
  - Connected the schedule page to `App.jsx` and the main dashboard sidebar.

### Step 5: Implement Graphical Syllabus Explorer
- **Action**: Created `SyllabusGraph.jsx` and integrated it in `PodPage.jsx`. It translates hierarchical JSON syllabus arrays into a multi-column visual node graph. Displays chapters, topics, and subtopics dynamically with connecting SVG bezier curves. Features progress indicators, completion state glowing borders, and AI tutoring quick study prompts.

### Step 6: Local-First Classroom Chat
- **Action**: Created `PodChat.jsx` and registered it inside `PodNavbar.jsx` and `PodPage.jsx`. Stored chat messages directly in local browser storage (`localStorage`). Provided a local-first settings pane featuring simulated Google Drive backup authentication and auto-delete settings.

### Step 7: Single-Container Hugging Face Deployment & Catch-All Routing
- **Action**: Created a multi-stage `Dockerfile` in the project root to compile the React client into static assets and package them into the FastAPI backend image. Setup a catch-all endpoint `/{catchall:path}` to serve SPA pages and dynamic environment-aware WebSocket endpoints.

### Step 8: Interactive Past Lecture Transcript UI
- **Action**: Created `PastLectures.jsx` component and integrated it below the syllabus in `PodPage.jsx`. It fetches transcript logs and AI-generated concepts/summaries directly from the database and exposes them as expandable/collapsible glassmorphic lecture logs.
