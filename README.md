# Partner

Partner is an educational platform designed to manage classes, syllabi, schedules, attendance, and live interactive sessions. It features a React-based frontend and a fast, asynchronous FastAPI backend.

## 🚀 Features

- **Pod Management**: Create and manage learning pods with specific semesters, subjects, and structured syllabi.
- **Hierarchical Syllabus Tracking**: Parses syllabi into structured JSON formats (Chapters -> Topics -> Subtopics) and tracks completion with interactive SVGs.
- **Google Sign-In & Auditing**: Secured user authentication with Google Accounts and database logs storing user logins and timestamps.
- **Database Backup System**: Easy downloading of database backups (SQLite `.db` files or PostgreSQL JSON dumps) directly from the dashboard.
- **Live Class Interactive Sessions**: A WebSocket-powered live classroom session feature that links classes to schedules, logs live transcripts, generates key concepts and recaps, and indexes lectures into ChromaDB for RAG.
- **Single-Container Deployment**: Fully optimized with a multi-stage `Dockerfile` to compile frontend assets and serve them directly via Uvicorn/FastAPI, ready for deployment on Hugging Face Spaces.

## 💻 Tech Stack

- **Frontend**: React 19, Vite, TailwindCSS, Framer Motion, Lucide React, React Router, Google Identity Services.
- **Backend**: FastAPI, SQLAlchemy, SQLite/PostgreSQL, Uvicorn, WebSockets, Pydantic, PyJWT.
- **AI & RAG**: Google Gemini API, ChromaDB Vector Store, LangChain.

## 🛠️ Getting Started

### Quick Local Startup
You can launch both the frontend and backend servers together on Windows by executing:
```bash
start_partner.bat
```

### Docker Container Build
To run the production bundle locally inside a single container (matching Hugging Face Spaces deployment):
```bash
docker build -t partner-app .
docker run -p 7860:7860 partner-app
```
*The app will then be available on `http://localhost:7860`.*

### Manual Developer Setup

#### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install the required Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the FastAPI development server:
   ```bash
   python main.py
   ```
   *The API will be available at `http://localhost:8000`. You can view the automatic interactive API documentation at `http://localhost:8000/docs`.*

#### Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the necessary Node dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend development server will be available at `http://localhost:5173`.*

## 📁 Project Structure

- `/backend`: Contains the FastAPI application, database engines (`partner.db`), WebSocket routing, and local data directories (`/attendance`, `/syllabus`).
- `/frontend`: Contains the React/Vite web application, Tailwind configuration, and UI styling.
- `Dockerfile`: Multi-stage Docker deployment script.
- `start_partner.bat`: Shortcut batch script to boot development environments.
