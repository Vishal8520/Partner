from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
import time
from sqlalchemy import create_engine, Column, Integer, String, Text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from pydantic import BaseModel, ConfigDict
import uuid
import json
import os
from dotenv import load_dotenv
from typing import List, Optional
from fastapi import UploadFile, File
import shutil
import datetime
import jwt
from passlib.context import CryptContext
import bcrypt

# Try to import Google Auth libraries, fallback gracefully if not installed
try:
    from google.oauth2 import id_token
    from google.auth.transport import requests as google_requests
    GOOGLE_AUTH_AVAILABLE = True
except ImportError:
    GOOGLE_AUTH_AVAILABLE = False

# Setup password hashing
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
SECRET_KEY = "supersecret_partner_key"
ALGORITHM = "HS256"

# Load environment variables
load_dotenv()

# LangChain uses GOOGLE_API_KEY by default. 
# If the user only provides GEMINI_API_KEY, sync it.
if not os.environ.get("GOOGLE_API_KEY") and os.environ.get("GEMINI_API_KEY"):
    os.environ["GOOGLE_API_KEY"] = os.environ.get("GEMINI_API_KEY")

# Import RAG pipeline functions
from rag_pipeline import (
    process_document,
    chunk_text,
    add_documents_to_db,
    get_chat_chain,
    clear_vector_db,
    get_vector_store,
    format_chat_history,
    generate_live_outline,
    generate_live_quiz,
    generate_live_recap,
    categorize_intent
)

from engineering import (
    gsd_breaking_task, 
    ralph_loop_iteration, 
    code_rabbit_review,
    GSDRequest,
    RalphLoopRequest,
    CodeReviewRequest
)

# --- Constants ---
SYLLABUS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "syllabus")
os.makedirs(SYLLABUS_DIR, exist_ok=True)

ATTENDANCE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "attendance")
os.makedirs(ATTENDANCE_DIR, exist_ok=True)

# --- Database Setup ---
# Dynamically load PostgreSQL connection string from environment if present, else fallback to SQLite
SQLALCHEMY_DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./partner.db")

# PostgreSQL dialect configuration
from sqlalchemy import DateTime
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- Models ---
class Pod(Base):
    __tablename__ = "pods"
    id = Column(String, primary_key=True, default=lambda: uuid.uuid4().hex[:8])
    semester = Column(Integer)
    subject = Column(String)
    syllabus = Column(Text)

class ChatAnalytics(Base):
    __tablename__ = "chat_analytics"
    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(String, index=True, unique=True)
    user_query = Column(Text)
    ai_response = Column(Text)
    intent = Column(String)
    rating = Column(Integer, default=0) # 1 for thumbs up, -1 for down
    unanswered = Column(Integer, default=0) # 1 if fallback triggered

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)

class LoginLog(Base):
    __tablename__ = "login_logs"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)

class Schedule(Base):
    __tablename__ = "schedules"
    id = Column(String, primary_key=True, default=lambda: uuid.uuid4().hex[:8])
    pod_id = Column(String, index=True)
    title = Column(String)
    description = Column(Text, nullable=True)
    date = Column(String) # YYYY-MM-DD
    start_time = Column(String) # HH:MM
    end_time = Column(String) # HH:MM
    status = Column(String, default="scheduled") # scheduled, proposed_reschedule, cancelled
    proposed_new_date = Column(String, nullable=True)
    proposed_new_start = Column(String, nullable=True)
    proposed_new_end = Column(String, nullable=True)

class LiveSessionTranscript(Base):
    __tablename__ = "live_session_transcripts"
    id = Column(String, primary_key=True, default=lambda: uuid.uuid4().hex[:8])
    pod_id = Column(String, index=True)
    schedule_id = Column(String, nullable=True)
    class_title = Column(String)
    date = Column(String)
    transcript = Column(Text)
    recap = Column(Text)

Base.metadata.create_all(bind=engine)

# --- Schemas ---
class PodCreate(BaseModel):
    semester: int
    subject: str
    syllabus: str

class PodResponse(PodCreate):
    id: str
    progress: Optional[int] = 0
    model_config = ConfigDict(from_attributes=True)

class ToggleRequest(BaseModel):
    id: str
    completed: bool

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class AttendanceSubmitRequest(BaseModel):
    code: str
    roll: str

class ScheduleCreate(BaseModel):
    pod_id: str
    title: str
    description: Optional[str] = None
    date: str # YYYY-MM-DD
    start_time: str # HH:MM
    end_time: str # HH:MM

class ScheduleResponse(BaseModel):
    id: str
    pod_id: str
    title: str
    description: Optional[str] = None
    date: str
    start_time: str
    end_time: str
    status: str
    proposed_new_date: Optional[str] = None
    proposed_new_start: Optional[str] = None
    proposed_new_end: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class RescheduleProposeRequest(BaseModel):
    date: str
    start_time: str
    end_time: str

class GoogleLoginRequest(BaseModel):
    credential: str

# --- Syllabus Parser ---
def parse_syllabus(text: str) -> dict:
    """
    Parses syllabus text into hierarchical JSON.

    Format:
      Ch-1:topic1-subtopic1, subtopic2. topic2-subtopic1, subtopic2
      Ch-2:topic1-subtopic1, subtopic2. topic2-subtopic1, subtopic2

    - Chapters separated by newlines
    - ':' separates chapter name from topics
    - '.' separates topics within a chapter
    - '-' separates a topic name from its subtopics
    - ',' separates subtopics
    """
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    chapters = []

    for ch_idx, line in enumerate(lines):
        colon_idx = line.find(':')

        if colon_idx == -1:
            chapters.append({
                "id": f"ch-{ch_idx}",
                "name": line,
                "completed": False,
                "topics": []
            })
            continue

        chapter_name = line[:colon_idx].strip()
        topics_str = line[colon_idx + 1:].strip()
        topic_parts = [t.strip() for t in topics_str.split('.') if t.strip()]

        topics = []
        for t_idx, part in enumerate(topic_parts):
            hyphen_idx = part.find('-')

            if hyphen_idx == -1:
                topics.append({
                    "id": f"ch-{ch_idx}-t-{t_idx}",
                    "name": part,
                    "completed": False,
                    "subtopics": []
                })
            else:
                topic_name = part[:hyphen_idx].strip()
                subs_str = part[hyphen_idx + 1:].strip()
                subtopics = [s.strip() for s in subs_str.split(',') if s.strip()]

                topics.append({
                    "id": f"ch-{ch_idx}-t-{t_idx}",
                    "name": topic_name,
                    "completed": False,
                    "subtopics": [
                        {
                            "id": f"ch-{ch_idx}-t-{t_idx}-s-{s_idx}",
                            "name": sub,
                            "completed": False
                        }
                        for s_idx, sub in enumerate(subtopics)
                    ]
                })

        chapters.append({
            "id": f"ch-{ch_idx}",
            "name": chapter_name,
            "completed": False,
            "topics": topics
        })

    return {"chapters": chapters}


def save_syllabus(pod_id: str, data: dict):
    path = os.path.join(SYLLABUS_DIR, f"{pod_id}.json")
    with open(path, 'w') as f:
        json.dump(data, f, indent=2)


def load_syllabus(pod_id: str) -> dict:
    path = os.path.join(SYLLABUS_DIR, f"{pod_id}.json")
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Syllabus file not found")
    with open(path, 'r') as f:
        return json.load(f)


# --- Attendance Helper ---
def generate_default_attendance() -> dict:
    return {
        "dates": ["2026-02-01", "2026-02-02", "2026-02-03"],
        "students": [
            {"name": "Bhavesh", "roll": "UCSE1001", "attendance": {"2026-02-01": True, "2026-02-02": True, "2026-02-03": True}},
            {"name": "Garvit", "roll": "UCSE1002", "attendance": {"2026-02-01": True, "2026-02-02": True, "2026-02-03": True}},
            {"name": "Deepak", "roll": "UCSE1003", "attendance": {"2026-02-01": True, "2026-02-02": True, "2026-02-03": True}},
            {"name": "Aarun", "roll": "UCSE1004", "attendance": {"2026-02-01": True, "2026-02-02": True, "2026-02-03": True}},
            {"name": "Sita", "roll": "UCSE1005", "attendance": {"2026-02-01": True, "2026-02-02": True, "2026-02-03": True}}
        ]
    }

def save_attendance(pod_id: str, data: dict):
    path = os.path.join(ATTENDANCE_DIR, f"{pod_id}.json")
    with open(path, 'w') as f:
        json.dump(data, f, indent=2)

def load_attendance(pod_id: str) -> dict:
    path = os.path.join(ATTENDANCE_DIR, f"{pod_id}.json")
    if not os.path.exists(path):
        # Graceful fallback for existing pods without attendance file
        default_data = generate_default_attendance()
        save_attendance(pod_id, default_data)
        return default_data
    with open(path, 'r') as f:
        return json.load(f)



# --- Dependency ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- App Initialization ---
app = FastAPI(title="Partner API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    frontend_dist_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "frontend", "dist")
    index_file = os.path.join(frontend_dist_path, "index.html")
    if os.path.exists(index_file):
        from fastapi.responses import FileResponse
        return FileResponse(index_file)
    return {"message": "Welcome to the Partner API!"}

@app.post("/api/pods", response_model=PodResponse)
def create_pod(pod: PodCreate, db: Session = Depends(get_db)):
    db_pod = Pod(semester=pod.semester, subject=pod.subject, syllabus=pod.syllabus)
    db.add(db_pod)
    db.commit()
    db.refresh(db_pod)

    # Parse syllabus and save to JSON file
    syllabus_data = parse_syllabus(pod.syllabus)
    save_syllabus(db_pod.id, syllabus_data)

    # Generate and save default attendance to JSON file
    attendance_data = generate_default_attendance()
    save_attendance(db_pod.id, attendance_data)

    # Clear syllabus from DB (data now lives in JSON)
    db_pod.syllabus = ""
    db.commit()

    return db_pod

def calculate_progress(pod_id: str) -> int:
    try:
        data = load_syllabus(pod_id)
        total = 0
        completed = 0
        for ch in data.get("chapters", []):
            total += 1
            if ch.get("completed"): completed += 1
            for t in ch.get("topics", []):
                total += 1
                if t.get("completed"): completed += 1
                for s in t.get("subtopics", []):
                    total += 1
                    if s.get("completed"): completed += 1
        return int((completed / total) * 100) if total > 0 else 0
    except:
        return 0

@app.get("/api/pods", response_model=list[PodResponse])
def get_pods(db: Session = Depends(get_db)):
    pods = db.query(Pod).all()
    # Attach dynamic progress to each pod before returning
    for p in pods:
        p.progress = calculate_progress(p.id)
    return pods

# --- Auth Endpoints ---
@app.post("/api/register")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    try:
        # Check if username or email already exists
        db_user = db.query(User).filter((User.username == user.username) | (User.email == user.email)).first()
        if db_user:
            raise HTTPException(status_code=400, detail="Username or email already registered")
        
        hashed_password = pwd_context.hash(user.password)
        new_user = User(username=user.username, email=user.email, password_hash=hashed_password)
        db.add(new_user)
        db.commit()
        return {"message": "User registered successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Register error: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred during registration. Please try again.")

import bcrypt # Added bcrypt import
@app.post("/api/login")
def login_user(user: UserLogin, request: Request, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid username or password")
        
    verified = False
    
    if db_user.password_hash.startswith("$2b$"):
        # Legacy bcrypt hash detected
        try:
            if bcrypt.checkpw(user.password.encode('utf-8'), db_user.password_hash.encode('utf-8')):
                verified = True
                # Transparently migrate to the new pbkdf2_sha256 hash
                db_user.password_hash = pwd_context.hash(user.password)
                db.commit()
        except Exception as e:
            print(f"Bcrypt verification failed: {e}")
    else:
        # Standard pbkdf2_sha256 hash
        try:
            verified = pwd_context.verify(user.password, db_user.password_hash)
        except Exception as e:
            print(f"Pbkdf2 verification failed: {e}")
            
    if not verified:
        raise HTTPException(status_code=400, detail="Invalid username or password")

    # Record login audit timestamp to database
    try:
        ip = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "unknown")
        login_log = LoginLog(username=db_user.username, ip_address=ip, user_agent=user_agent)
        db.add(login_log)
        db.commit()
    except Exception as e:
        print(f"Failed to record login audit log: {e}")
        
    expiration = datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    token = jwt.encode(
        {"sub": db_user.username, "exp": expiration},
        SECRET_KEY, 
        algorithm=ALGORITHM
    )
    return {"access_token": token, "token_type": "bearer", "username": db_user.username}


@app.post("/api/auth/google")
def google_login(req: GoogleLoginRequest, request: Request, db: Session = Depends(get_db)):
    username = None
    email = None
    
    if GOOGLE_AUTH_AVAILABLE:
        try:
            CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")
            idinfo = id_token.verify_oauth2_token(req.credential, google_requests.Request(), CLIENT_ID)
            email = idinfo.get('email')
            username = idinfo.get('name', email.split('@')[0])
        except Exception as e:
            print(f"Google Token Verification failed: {e}")
            raise HTTPException(status_code=400, detail=f"Google Authentication failed: {str(e)}")
    else:
        # Fallback decryption for local environment testing
        try:
            import base64
            parts = req.credential.split('.')
            if len(parts) >= 2:
                payload = json.loads(base64.b64decode(parts[1] + "==").decode('utf-8'))
                email = payload.get('email', 'google_user@partner.com')
                username = payload.get('name', email.split('@')[0])
            else:
                email = "google_user@partner.com"
                username = "Partner Google User"
        except Exception as e:
            email = "google_user@partner.com"
            username = "Partner Google User"
            
    db_user = db.query(User).filter((User.email == email) | (User.username == username)).first()
    if not db_user:
        db_user = User(username=username, email=email, password_hash=pwd_context.hash(uuid.uuid4().hex))
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

    try:
        ip = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "unknown")
        login_log = LoginLog(username=db_user.username, ip_address=ip, user_agent=user_agent)
        db.add(login_log)
        db.commit()
    except Exception as e:
        print(f"Failed to record google login audit: {e}")

    expiration = datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    token = jwt.encode(
        {"sub": db_user.username, "exp": expiration},
        SECRET_KEY, 
        algorithm=ALGORITHM
    )
    return {"access_token": token, "token_type": "bearer", "username": db_user.username}


# --- Live Session Agents ---


def get_recommended_simulations(outline_text: str):
    """Mocks matching current topics to a local simulation library."""
    # Pre-loaded Simulation Library for demo purposes
    library = [
        {"id": 1, "title": "Circuit Builder", "topic": "circuit", "url": "/sims/circuit"},
        {"id": 2, "title": "Microcontroller Logic", "topic": "logic", "url": "/sims/logic"},
        {"id": 3, "title": "Embedded Systems Basics", "topic": "embedded", "url": "/sims/embedded"},
    ]
    
    outline_lower = outline_text.lower()
    matches = []
    for sim in library:
        if sim["topic"] in outline_lower:
            matches.append(sim)
            
    # Default if no match
    if not matches:
        return [library[0]]
    return matches

# --- WebSocket Endpoint ---

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/live-session")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    outline_history = []
    all_text_chunks = []
    start_time = time.time()
    last_quiz_time = start_time
    
    # State variables for the class session
    pod_id = None
    schedule_id = None
    class_title = "Live Lecture"
    
    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            
            event_type = payload.get("type")
            
            if event_type == "start_session":
                pod_id = payload.get("pod_id")
                schedule_id = payload.get("schedule_id")
                class_title = payload.get("class_title", "Live Lecture")
                print(f"WebSocket class session started: Pod={pod_id}, Title={class_title}")
                
            elif event_type == "audio_chunk":
                text_chunk = payload.get("content", "")
                if text_chunk.strip():
                    all_text_chunks.append(text_chunk)
                    # 1. Generate Outline
                    new_bullets = await generate_live_outline(text_chunk)
                    outline_history.extend(new_bullets)
                    
                    await manager.send_personal_message(json.dumps({
                        "type": "outline_update",
                        "content": new_bullets
                    }), websocket)
                    
                    # 2. Check for Simulations
                    sims = get_recommended_simulations(text_chunk)
                    await manager.send_personal_message(json.dumps({
                        "type": "simulation_update",
                        "content": sims
                    }), websocket)
                    
                    # 3. Check if Quiz should be generated (Mocking 15 mins to 1 min for testing)
                    # For demo purposes, we can trigger it every 20 seconds of active session
                    current_time = time.time()
                    if current_time - last_quiz_time > 20: 
                        quiz = await generate_live_quiz(outline_history)
                        await manager.send_personal_message(json.dumps({
                            "type": "quiz_update",
                            "content": quiz
                        }), websocket)
                        last_quiz_time = current_time

            elif event_type == "end_session":
                recap = await generate_live_recap(outline_history)
                
                # 1. Save live transcript to ChromaDB
                try:
                    full_transcript = "\n\n".join(all_text_chunks)
                    if full_transcript.strip():
                        chunks = chunk_text(full_transcript, source="Live Session Transcript")
                        add_documents_to_db(chunks, get_vector_store())
                        print("Saved live session to vector database.")
                except Exception as e:
                    print(f"Failed to save session to DB: {e}")
                
                # 2. Save live transcript to relational DB
                if pod_id:
                    try:
                        db_session = SessionLocal()
                        full_transcript = "\n\n".join(all_text_chunks)
                        today_str = datetime.date.today().isoformat()
                        db_transcript = LiveSessionTranscript(
                            pod_id=pod_id,
                            schedule_id=schedule_id,
                            class_title=class_title,
                            date=today_str,
                            transcript=full_transcript,
                            recap=recap
                        )
                        db_session.add(db_transcript)
                        db_session.commit()
                        db_session.close()
                        print("Saved live session transcript to relational database.")
                    except Exception as db_err:
                        print(f"Failed to save transcript to relational DB: {db_err}")

                await manager.send_personal_message(json.dumps({
                    "type": "recap_update",
                    "content": recap
                }), websocket)
                # optionally break or close
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/api/pods/{pod_id}", response_model=PodResponse)
def get_pod(pod_id: str, db: Session = Depends(get_db)):
    pod = db.query(Pod).filter(Pod.id == pod_id).first()
    if not pod:
        raise HTTPException(status_code=404, detail="Pod not found")
    return pod

@app.get("/api/pods/{pod_id}/syllabus")
def get_syllabus(pod_id: str):
    return load_syllabus(pod_id)

@app.patch("/api/pods/{pod_id}/syllabus")
def update_syllabus_item(pod_id: str, req: ToggleRequest):
    data = load_syllabus(pod_id)
    found = False

    for chapter in data["chapters"]:
        if chapter["id"] == req.id:
            chapter["completed"] = req.completed
            found = True
            break
        for topic in chapter.get("topics", []):
            if topic["id"] == req.id:
                topic["completed"] = req.completed
                found = True
                break
            for sub in topic.get("subtopics", []):
                if sub["id"] == req.id:
                    sub["completed"] = req.completed
                    found = True
                    break
            if found:
                break
        if found:
            break

    if not found:
        raise HTTPException(status_code=404, detail=f"Item '{req.id}' not found in syllabus")

    save_syllabus(pod_id, data)
    return {"status": "ok"}

@app.put("/api/pods/{pod_id}/syllabus")
def update_full_syllabus(pod_id: str, syllabus: dict):
    save_syllabus(pod_id, syllabus)
    return {"status": "ok"}

@app.get("/api/pods/{pod_id}/attendance")
def get_attendance(pod_id: str):
    return load_attendance(pod_id)

@app.put("/api/pods/{pod_id}/attendance")
def update_attendance(pod_id: str, attendance: dict):
    save_attendance(pod_id, attendance)
    
    try:
        summary_lines = [f"Class roster and attendance for Pod '{pod_id}':"]
        for student in attendance.get("students", []):
            name = student.get("name", "Unknown")
            roll = student.get("roll", "Unknown")
            att_records = student.get("attendance", {})
            
            att_str = ", ".join([f"{date}: {'Present' if is_present else 'Absent'}" for date, is_present in att_records.items()])
            summary_lines.append(f"Student {name} (Roll No {roll}) Attendance records: {att_str if att_str else 'No records yet.'}")
            
        full_summary = "\n".join(summary_lines)
        
        chunks = chunk_text(full_summary, source=f"Attendance Pod {pod_id}")
        vs = get_vector_store()
        add_documents_to_db(chunks, vs)
        print(f"Indexed attendance data for pod {pod_id} into ChromaDB.")
    except Exception as e:
        print(f"Failed to index attendance data: {e}")
        
    return {"status": "ok"}


# --- Automated Attendance & Class Scheduling Endpoints ---

active_attendance_sessions = {}

@app.post("/api/pods/{pod_id}/attendance/session")
def start_attendance_session(pod_id: str):
    import random
    code = f"{random.randint(100000, 999999)}"
    expires_at = time.time() + 60.0
    active_attendance_sessions[pod_id] = {
        "code": code,
        "expires_at": expires_at
    }
    return {"code": code, "expires_in": 60}

@app.post("/api/pods/{pod_id}/attendance/submit")
def submit_attendance_code(pod_id: str, req: AttendanceSubmitRequest):
    session = active_attendance_sessions.get(pod_id)
    if not session:
        raise HTTPException(status_code=400, detail="No active attendance session for this Pod.")
    if time.time() > session["expires_at"]:
        active_attendance_sessions.pop(pod_id, None)
        raise HTTPException(status_code=400, detail="The attendance session has expired.")
    if session["code"] != req.code:
        raise HTTPException(status_code=400, detail="Invalid attendance code.")
    
    try:
        attendance_data = load_attendance(pod_id)
        today = datetime.date.today().isoformat()
        
        if today not in attendance_data.get("dates", []):
            attendance_data["dates"].append(today)
            for student in attendance_data.get("students", []):
                student["attendance"][today] = False
                
        student_found = False
        for student in attendance_data.get("students", []):
            if student.get("roll", "").lower() == req.roll.lower():
                student["attendance"][today] = True
                student_found = True
                break
                
        if not student_found:
            raise HTTPException(status_code=404, detail=f"Student with roll number '{req.roll}' not found in roster.")
            
        save_attendance(pod_id, attendance_data)
        return {"status": "success", "message": f"Successfully registered attendance for today ({today})."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/schedule", response_model=ScheduleResponse)
def create_schedule(sch: ScheduleCreate, db: Session = Depends(get_db)):
    db_sch = Schedule(
        pod_id=sch.pod_id,
        title=sch.title,
        description=sch.description,
        date=sch.date,
        start_time=sch.start_time,
        end_time=sch.end_time,
        status="scheduled"
    )
    db.add(db_sch)
    db.commit()
    db.refresh(db_sch)
    return db_sch

@app.get("/api/pods/{pod_id}/schedule", response_model=list[ScheduleResponse])
def get_pod_schedule(pod_id: str, db: Session = Depends(get_db)):
    return db.query(Schedule).filter(Schedule.pod_id == pod_id).all()

@app.get("/api/schedule/all", response_model=list[ScheduleResponse])
def get_all_schedules(db: Session = Depends(get_db)):
    return db.query(Schedule).all()

@app.post("/api/schedule/{schedule_id}/reschedule")
def propose_reschedule(schedule_id: str, req: RescheduleProposeRequest, db: Session = Depends(get_db)):
    sch = db.query(Schedule).filter(Schedule.id == schedule_id).first()
    if not sch:
        raise HTTPException(status_code=404, detail="Schedule class not found")
    sch.status = "proposed_reschedule"
    sch.proposed_new_date = req.date
    sch.proposed_new_start = req.start_time
    sch.proposed_new_end = req.end_time
    db.commit()
    return {"status": "ok", "message": "Rescheduling proposed successfully"}

@app.post("/api/schedule/{schedule_id}/accept")
def accept_reschedule(schedule_id: str, db: Session = Depends(get_db)):
    sch = db.query(Schedule).filter(Schedule.id == schedule_id).first()
    if not sch:
        raise HTTPException(status_code=404, detail="Schedule class not found")
    if sch.status != "proposed_reschedule":
        raise HTTPException(status_code=400, detail="No reschedule proposal exists for this class.")
    sch.date = sch.proposed_new_date
    sch.start_time = sch.proposed_new_start
    sch.end_time = sch.proposed_new_end
    sch.status = "scheduled"
    sch.proposed_new_date = None
    sch.proposed_new_start = None
    sch.proposed_new_end = None
    db.commit()
    return {"status": "ok", "message": "Rescheduling proposal accepted"}


@app.post("/api/schedule/{schedule_id}/cancel")
def cancel_class(schedule_id: str, db: Session = Depends(get_db)):
    sch = db.query(Schedule).filter(Schedule.id == schedule_id).first()
    if not sch:
        raise HTTPException(status_code=404, detail="Schedule class not found")
    sch.status = "cancelled"
    db.commit()
    return {"status": "ok", "message": "Class cancelled"}


@app.get("/api/database/backup")
def get_db_backup(db: Session = Depends(get_db)):
    # Look for SQLite databases in current directory
    db_file = None
    for name in ["partner.db", "partner.db", "database.db"]:
        if os.path.exists(name):
            db_file = name
            break
            
    if db_file and SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
        from fastapi.responses import FileResponse
        backup_filename = f"partner_backup_{int(time.time())}.db"
        return FileResponse(db_file, filename=backup_filename, media_type="application/octet-stream")
    else:
        try:
            backup_data = {
                "timestamp": datetime.datetime.utcnow().isoformat(),
                "users": [{"id": u.id, "username": u.username, "email": u.email} for u in db.query(User).all()],
                "pods": [{"id": p.id, "semester": p.semester, "subject": p.subject} for p in db.query(Pod).all()],
                "schedules": [
                    {
                        "id": s.id, "pod_id": s.pod_id, "title": s.title, 
                        "description": s.description, "date": s.date, 
                        "start_time": s.start_time, "end_time": s.end_time, 
                        "status": s.status
                    } 
                    for s in db.query(Schedule).all()
                ],
                "login_logs": [
                    {
                        "id": l.id, "username": l.username, 
                        "timestamp": l.timestamp.isoformat(), 
                        "ip_address": l.ip_address, "user_agent": l.user_agent
                    } 
                    for l in db.query(LoginLog).all()
                ],
                "transcripts": [
                    {
                        "id": t.id, "pod_id": t.pod_id, "schedule_id": t.schedule_id, 
                        "class_title": t.class_title, "date": t.date, 
                        "transcript": t.transcript, "recap": t.recap
                    } 
                    for t in db.query(LiveSessionTranscript).all()
                ]
            }
            from fastapi.responses import JSONResponse
            headers = {"Content-Disposition": f"attachment; filename=partner_backup_{int(time.time())}.json"}
            return JSONResponse(content=backup_data, headers=headers)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Database dump failed: {str(e)}")

@app.get("/api/pods/{pod_id}/transcripts")
def get_pod_transcripts(pod_id: str, db: Session = Depends(get_db)):
    return db.query(LiveSessionTranscript).filter(LiveSessionTranscript.pod_id == pod_id).all()


@app.delete("/api/pods/{pod_id}")
def delete_pod(pod_id: str, db: Session = Depends(get_db)):
    pod = db.query(Pod).filter(Pod.id == pod_id).first()
    if not pod:
        raise HTTPException(status_code=404, detail="Pod not found")
    db.delete(pod)
    db.commit()

    # Remove syllabus JSON file if it exists
    syllabus_path = os.path.join(SYLLABUS_DIR, f"{pod_id}.json")
    if os.path.exists(syllabus_path):
        os.remove(syllabus_path)

    # Remove attendance JSON file if it exists
    attendance_path = os.path.join(ATTENDANCE_DIR, f"{pod_id}.json")
    if os.path.exists(attendance_path):
        os.remove(attendance_path)

    return {"status": "deleted"}

# --- Chatbot Endpoints ---

class ChatRequest(BaseModel):
    message: str
    chat_history: List[dict] = []

class FeedbackRequest(BaseModel):
    message_id: str
    rating: int

@app.post("/api/chat")
async def chat_with_ai(req: ChatRequest, db: Session = Depends(get_db)):
    try:
        # Phase 3: Intent Classification
        intent = await categorize_intent(req.message)
        
        # Phase 2 & 3: Pedagogical Prompting based on Intent
        chain = get_chat_chain(intent=intent)
        formatted_history = format_chat_history(req.chat_history)
        
        response = chain.invoke({
            "input": req.message,
            "chat_history": formatted_history
        })
        
        answer = response.get('answer', "I'm sorry, I couldn't process that.")
        source_names = list(set([doc.metadata.get("source", "Unknown") for doc in response.get('context', [])]))
        
        # Phase 4: Feedback Tracking
        is_unanswered = 1 if "do not have enough information" in answer.lower() or "i'm sorry" in answer.lower() else 0
        message_id = uuid.uuid4().hex
        
        analytics = ChatAnalytics(
            message_id=message_id,
            user_query=req.message,
            ai_response=answer,
            intent=intent,
            unanswered=is_unanswered
        )
        db.add(analytics)
        db.commit()
        
        return {
            "answer": answer,
            "sources": source_names,
            "message_id": message_id,
            "intent_detected": intent
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from fastapi.responses import StreamingResponse

@app.post("/api/chat/stream")
async def chat_with_ai_stream(req: ChatRequest, db: Session = Depends(get_db)):
    try:
        # Phase 3: Intent Classification
        intent = await categorize_intent(req.message)
        
        # Phase 2 & 3: Pedagogical Prompting based on Intent
        chain = get_chat_chain(intent=intent)
        formatted_history = format_chat_history(req.chat_history)
        
        async def event_generator():
            full_response = ""
            # Using a_stream for async token generation
            async for chunk in chain.astream({
                "input": req.message,
                "chat_history": formatted_history
            }):
                # LangChain retrieval chain returns a dict
                # We want the 'answer' part if it exists
                if isinstance(chunk, dict) and 'answer' in chunk:
                    token = chunk['answer']
                    full_response += token
                    yield f"data: {json.dumps({'token': token})}\n\n"
                elif isinstance(chunk, str):
                    full_response += chunk
                    yield f"data: {json.dumps({'token': chunk})}\n\n"
            
            # After stream completes, log to analytics
            message_id = uuid.uuid4().hex
            is_unanswered = 1 if "do not have enough information" in full_response.lower() or "i'm sorry" in full_response.lower() else 0
            
            analytics = ChatAnalytics(
                message_id=message_id,
                user_query=req.message,
                ai_response=full_response,
                intent=intent,
                unanswered=is_unanswered
            )
            db.add(analytics)
            db.commit()
            
            # Final message with metadata
            yield f"data: {json.dumps({'message_id': message_id, 'intent': intent, 'done': True})}\n\n"

        return StreamingResponse(event_generator(), media_type="text/event-stream")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat/feedback")
def submit_feedback(req: FeedbackRequest, db: Session = Depends(get_db)):
    analytics = db.query(ChatAnalytics).filter(ChatAnalytics.message_id == req.message_id).first()
    if analytics:
        analytics.rating = req.rating
        db.commit()
        return {"status": "ok"}
    raise HTTPException(status_code=404, detail="Message not found")

@app.post("/api/chat/upload")
async def upload_document(file: UploadFile = File(...)):
    temp_dir = "./temp_uploads"
    os.makedirs(temp_dir, exist_ok=True)
    temp_path = os.path.join(temp_dir, file.filename)
    
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Extract and Process
        text = process_document(file.filename, temp_path)
        chunks = chunk_text(text, source=file.filename)
        
        # Add to Vector Store
        vs = get_vector_store()
        add_documents_to_db(chunks, vs)
        
        return {"status": "success", "filename": file.filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.post("/api/chat/clear")
async def clear_chat_db():
    try:
        clear_vector_db()
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Engineering Endpoints ---

@app.post("/api/engineering/gsd")
async def gsd_endpoint(req: GSDRequest):
    steps = await gsd_breaking_task(req.task)
    return {"steps": steps}

@app.post("/api/engineering/ralph-loop")
async def ralph_loop_endpoint(req: RalphLoopRequest):
    result = await ralph_loop_iteration(req.prd)
    return result

@app.post("/api/engineering/code-review")
async def code_review_endpoint(req: CodeReviewRequest):
    suggestions = await code_rabbit_review(req.code)
    return {"suggestions": suggestions}

# --- Static File Serving for Hugging Face Deployment ---
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

frontend_dist_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "frontend", "dist")

if os.path.exists(frontend_dist_path):
    assets_path = os.path.join(frontend_dist_path, "assets")
    if os.path.exists(assets_path):
        app.mount("/assets", StaticFiles(directory=assets_path), name="assets")
        
    @app.get("/{catchall:path}")
    def serve_frontend(catchall: str):
        if catchall.startswith("api/") or catchall.startswith("ws/"):
            raise HTTPException(status_code=404, detail="Not Found")
            
        # Check if the requested file exists directly in frontend_dist_path (e.g. favicon.svg)
        file_path = os.path.join(frontend_dist_path, catchall)
        if catchall and os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
            
        index_file = os.path.join(frontend_dist_path, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"error": "Frontend build missing."}


if __name__ == "__main__":
    import uvicorn
    # Hugging Face Spaces defaults to port 7860
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
