"""
Live Speech Transcription + Quiz Generator
==========================================
Requirements:
    pip install SpeechRecognition pyaudio anthropic colorama

Usage:
    python live_transcript_quiz.py

Controls:
    - Press ENTER to generate a quiz from current transcript
    - Type 'clear' + ENTER to clear transcript
    - Type 'save' + ENTER to save transcript to file
    - Press Ctrl+C to exit
"""

import speech_recognition as sr
import anthropic
import threading
import queue
import time
import sys
import os
import json
import signal
from datetime import datetime
from colorama import init, Fore, Style, Back
from dotenv import load_dotenv

load_dotenv()

if sys.stdout.encoding.lower() not in ("utf-8", "utf8"):
    sys.stdout.reconfigure(encoding="utf-8")

init(autoreset=True)

# ─── CONFIG ───────────────────────────────────────────────────────────────────

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")  # Set via env or replace here
LANGUAGE = "en-US"                  # Speech recognition language
ENERGY_THRESHOLD = 300              # Mic sensitivity (lower = more sensitive)
PAUSE_THRESHOLD = 0.8               # Seconds of silence before phrase ends
PHRASE_TIME_LIMIT = 15              # Max seconds per phrase
DYNAMIC_ENERGY = True               # Auto-adjust to ambient noise
QUIZ_QUESTIONS = 5                  # Default number of quiz questions
MAX_TRANSCRIPT_WORDS = 3000         # Trim transcript if too long

# ─── COLORS / UI ──────────────────────────────────────────────────────────────

def banner():
    print(Fore.CYAN + Style.BRIGHT + """
╔══════════════════════════════════════════════════════════════╗
║          🎤  LIVE SPEECH TRANSCRIPT + QUIZ GENERATOR         ║
║                  Powered by Claude AI                        ║
╚══════════════════════════════════════════════════════════════╝""")
    print(Fore.YELLOW + "  Controls:")
    print(Fore.WHITE + "    • Speak naturally — transcript appears live")
    print(Fore.WHITE + "    • Press " + Fore.GREEN + "ENTER" + Fore.WHITE + "       → Generate quiz from transcript")
    print(Fore.WHITE + "    • Type   " + Fore.CYAN + "'clear'" + Fore.WHITE + "     → Clear the transcript")
    print(Fore.WHITE + "    • Type   " + Fore.CYAN + "'save'" + Fore.WHITE + "      → Save transcript to file")
    print(Fore.WHITE + "    • Type   " + Fore.CYAN + "'quiz N'" + Fore.WHITE + "    → Generate N-question quiz")
    print(Fore.WHITE + "    • Press  " + Fore.RED + "Ctrl+C" + Fore.WHITE + "      → Exit\n")

def section(title):
    w = 62
    print(Fore.MAGENTA + Style.BRIGHT + f"\n{'─'*w}")
    print(Fore.MAGENTA + Style.BRIGHT + f"  {title}")
    print(Fore.MAGENTA + Style.BRIGHT + f"{'─'*w}")

def status(msg, color=Fore.CYAN):
    ts = datetime.now().strftime("%H:%M:%S")
    print(color + f"\n[{ts}] {msg}" + Style.RESET_ALL)

# ─── TRANSCRIPT STORE ─────────────────────────────────────────────────────────

class TranscriptStore:
    def __init__(self):
        self._lock = threading.Lock()
        self._segments = []          # list of (timestamp, text)
        self._word_count = 0

    def add(self, text: str):
        ts = datetime.now().strftime("%H:%M:%S")
        with self._lock:
            self._segments.append((ts, text.strip()))
            self._word_count += len(text.split())
            # Trim old segments if too long
            while self._word_count > MAX_TRANSCRIPT_WORDS and len(self._segments) > 1:
                removed = self._segments.pop(0)
                self._word_count -= len(removed[1].split())

    def full_text(self) -> str:
        with self._lock:
            return " ".join(seg[1] for seg in self._segments)

    def formatted(self) -> str:
        with self._lock:
            return "\n".join(f"[{ts}] {txt}" for ts, txt in self._segments)

    def clear(self):
        with self._lock:
            self._segments.clear()
            self._word_count = 0

    @property
    def word_count(self):
        return self._word_count

    def save(self, path: str):
        with self._lock:
            with open(path, "w", encoding="utf-8") as f:
                f.write(f"Live Transcript — {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                f.write("=" * 60 + "\n\n")
                for ts, txt in self._segments:
                    f.write(f"[{ts}] {txt}\n")


# ─── SPEECH LISTENER ──────────────────────────────────────────────────────────

class SpeechListener(threading.Thread):
    def __init__(self, transcript: TranscriptStore, print_queue: queue.Queue):
        super().__init__(daemon=True)
        self.transcript = transcript
        self.print_queue = print_queue
        self._stop_event = threading.Event()
        self._paused = threading.Event()
        self._paused.set()  # not paused by default

    def stop(self):
        self._stop_event.set()

    def pause(self):
        self._paused.clear()

    def resume(self):
        self._paused.set()

    def run(self):
        recognizer = sr.Recognizer()
        recognizer.energy_threshold = ENERGY_THRESHOLD
        recognizer.pause_threshold = PAUSE_THRESHOLD
        recognizer.dynamic_energy_threshold = DYNAMIC_ENERGY

        self.print_queue.put(("status", "🎙️  Microphone initializing..."))

        try:
            mic = sr.Microphone()
        except Exception as e:
            self.print_queue.put(("error", f"Microphone error: {e}\nMake sure PyAudio is installed and a mic is connected."))
            return

        with mic as source:
            self.print_queue.put(("status", "🔊 Calibrating for ambient noise (2s)..."))
            try:
                recognizer.adjust_for_ambient_noise(source, duration=2)
            except Exception:
                pass
            self.print_queue.put(("ready", "✅ Listening! Start speaking..."))

        while not self._stop_event.is_set():
            self._paused.wait()  # block if paused
            try:
                with mic as source:
                    audio = recognizer.listen(
                        source,
                        phrase_time_limit=PHRASE_TIME_LIMIT,
                        timeout=None
                    )
                text = recognizer.recognize_google(audio, language=LANGUAGE)
                if text.strip():
                    self.transcript.add(text)
                    self.print_queue.put(("speech", text))
            except sr.WaitTimeoutError:
                pass
            except sr.UnknownValueError:
                pass  # inaudible / silence
            except sr.RequestError as e:
                self.print_queue.put(("warn", f"⚠️  Google API error: {e} — retrying in 3s"))
                time.sleep(3)
            except OSError as e:
                self.print_queue.put(("error", f"Mic I/O error: {e}"))
                time.sleep(2)
            except Exception as e:
                self.print_queue.put(("warn", f"⚠️  Unexpected error: {e}"))
                time.sleep(1)


# ─── QUIZ GENERATOR ───────────────────────────────────────────────────────────

def generate_quiz(transcript_text: str, n_questions: int = QUIZ_QUESTIONS) -> dict | None:
    """Call Claude API to generate a structured quiz from transcript."""
    if not ANTHROPIC_API_KEY:
        print(Fore.RED + "\n❌ ANTHROPIC_API_KEY not set. Export it or paste it in the script.")
        return None

    if len(transcript_text.split()) < 20:
        print(Fore.YELLOW + "\n⚠️  Transcript too short. Keep speaking and try again!")
        return None

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    system_prompt = """You are an expert educational quiz designer. 
Given a speech transcript, generate a clear, accurate, and engaging quiz.
Respond ONLY with valid JSON — no markdown, no explanation, no backticks.
JSON structure:
{
  "topic": "Short topic title",
  "summary": "1-2 sentence summary of the transcript",
  "questions": [
    {
      "id": 1,
      "question": "Question text?",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "answer": "A",
      "explanation": "Brief explanation of the correct answer"
    }
  ]
}"""

    user_prompt = f"""Generate a {n_questions}-question multiple choice quiz from this transcript.
Make questions test real understanding, not trivia. Use simple language.

TRANSCRIPT:
{transcript_text[:6000]}"""

    try:
        print(Fore.CYAN + "\n⏳ Generating quiz with Claude AI...", end="", flush=True)
        response = client.messages.create(
            model="claude-3-5-sonnet-20240620",
            max_tokens=2000,
            system=system_prompt,
            messages=[{"role": "user", "content": user_prompt}]
        )
        raw = response.content[0].text.strip()
        # Strip any accidental markdown fences
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        quiz = json.loads(raw)
        print(Fore.GREEN + " Done!")
        return quiz
    except json.JSONDecodeError as e:
        print(Fore.RED + f"\n❌ Failed to parse quiz JSON: {e}")
        return None
    except anthropic.AuthenticationError:
        print(Fore.RED + "\n❌ Invalid API key. Check your ANTHROPIC_API_KEY.")
        return None
    except anthropic.APIError as e:
        print(Fore.RED + f"\n❌ Anthropic API error: {e}")
        return None
    except Exception as e:
        print(Fore.RED + f"\n❌ Quiz generation error: {e}")
        return None


def display_quiz(quiz: dict):
    """Pretty-print the quiz and run interactive mode."""
    section(f"📝  QUIZ — {quiz.get('topic', 'Generated Quiz')}")
    print(Fore.CYAN + f"  Summary: " + Fore.WHITE + quiz.get("summary", ""))
    print()

    questions = quiz.get("questions", [])
    score = 0
    answers_given = []

    for q in questions:
        print(Fore.YELLOW + Style.BRIGHT + f"  Q{q['id']}. {q['question']}")
        for opt in q.get("options", []):
            print(Fore.WHITE + f"       {opt}")

        while True:
            try:
                ans = input(Fore.GREEN + "       Your answer (A/B/C/D): ").strip().upper()
                if ans in ("A", "B", "C", "D"):
                    break
                print(Fore.RED + "       Please enter A, B, C, or D.")
            except (EOFError, KeyboardInterrupt):
                print()
                ans = "?"
                break

        correct = q.get("answer", "").upper()
        if ans == correct:
            print(Fore.GREEN + f"       ✅ Correct!")
            score += 1
        else:
            print(Fore.RED + f"       ❌ Wrong. Correct: {correct}")
        print(Fore.CYAN + f"       💡 {q.get('explanation', '')}\n")
        answers_given.append(ans)

    # Score
    total = len(questions)
    pct = int((score / total) * 100) if total else 0
    bar = "█" * (pct // 5) + "░" * (20 - pct // 5)
    color = Fore.GREEN if pct >= 70 else (Fore.YELLOW if pct >= 40 else Fore.RED)
    section("🏆  RESULTS")
    print(color + f"  Score: {score}/{total}  ({pct}%)")
    print(color + f"  [{bar}]")
    if pct == 100:
        print(Fore.GREEN + Style.BRIGHT + "\n  🌟 Perfect score! Outstanding!")
    elif pct >= 70:
        print(Fore.GREEN + "\n  👍 Well done!")
    elif pct >= 40:
        print(Fore.YELLOW + "\n  📚 Good effort — keep reviewing!")
    else:
        print(Fore.RED + "\n  💪 Keep going — review the transcript and try again!")

    # Save quiz to file
    save = input(Fore.CYAN + "\n  Save quiz+results to file? (y/n): ").strip().lower()
    if save == "y":
        fname = f"quiz_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        quiz["user_score"] = f"{score}/{total}"
        quiz["user_answers"] = answers_given
        with open(fname, "w") as f:
            json.dump(quiz, f, indent=2)
        print(Fore.GREEN + f"  ✅ Saved to {fname}")


# ─── PRINT WORKER ─────────────────────────────────────────────────────────────

class PrintWorker(threading.Thread):
    def __init__(self, pq: queue.Queue):
        super().__init__(daemon=True)
        self.pq = pq

    def run(self):
        while True:
            try:
                kind, msg = self.pq.get(timeout=0.5)
                if kind == "speech":
                    ts = datetime.now().strftime("%H:%M:%S")
                    print(Fore.WHITE + f"\n  [{ts}] " + Fore.LIGHTWHITE_EX + msg)
                elif kind == "status":
                    status(msg, Fore.CYAN)
                elif kind == "ready":
                    status(msg, Fore.GREEN)
                elif kind == "warn":
                    status(msg, Fore.YELLOW)
                elif kind == "error":
                    status(msg, Fore.RED)
            except queue.Empty:
                continue
            except Exception:
                continue


# ─── MAIN ─────────────────────────────────────────────────────────────────────

def main():
    banner()

    if not ANTHROPIC_API_KEY:
        print(Fore.YELLOW + "⚠️  ANTHROPIC_API_KEY not set.")
        print(Fore.WHITE + "   Set it via:  export ANTHROPIC_API_KEY=sk-ant-...\n")

    transcript = TranscriptStore()
    print_queue = queue.Queue()

    printer = PrintWorker(print_queue)
    printer.start()

    listener = SpeechListener(transcript, print_queue)
    listener.start()

    section("🎙️  LIVE TRANSCRIPT")
    print(Fore.CYAN + "  (transcript appears below as you speak)")

    def shutdown(sig=None, frame=None):
        print(Fore.RED + Style.BRIGHT + "\n\n👋 Shutting down gracefully...")
        listener.stop()
        sys.exit(0)

    signal.signal(signal.SIGINT, shutdown)

    # ── Command loop ──────────────────────────────────────────────────────────
    n_quiz = QUIZ_QUESTIONS
    while True:
        try:
            cmd = input("").strip().lower()
        except (EOFError, KeyboardInterrupt):
            shutdown()

        if cmd == "":
            # Generate quiz
            listener.pause()
            text = transcript.full_text()
            if not text:
                print(Fore.YELLOW + "  ⚠️  No transcript yet. Keep speaking!")
            else:
                quiz = generate_quiz(text, n_questions=n_quiz)
                if quiz:
                    display_quiz(quiz)
                    section("🎙️  LIVE TRANSCRIPT (resumed)")
            listener.resume()

        elif cmd == "clear":
            transcript.clear()
            print(Fore.GREEN + "  ✅ Transcript cleared.")

        elif cmd == "save":
            fname = f"transcript_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
            transcript.save(fname)
            print(Fore.GREEN + f"  ✅ Saved to {fname}")

        elif cmd.startswith("quiz "):
            try:
                n_quiz = int(cmd.split()[1])
                n_quiz = max(1, min(n_quiz, 20))
                print(Fore.GREEN + f"  ✅ Next quiz will have {n_quiz} questions.")
            except (ValueError, IndexError):
                print(Fore.RED + "  Usage: quiz <number>  (e.g. quiz 10)")

        elif cmd == "show":
            text = transcript.formatted()
            if text:
                section("📄  FULL TRANSCRIPT")
                print(Fore.WHITE + text)
            else:
                print(Fore.YELLOW + "  No transcript yet.")

        elif cmd == "stats":
            print(Fore.CYAN + f"  Words captured: {transcript.word_count}")

        elif cmd in ("exit", "quit"):
            shutdown()

        else:
            if cmd:
                print(Fore.YELLOW + "  Unknown command. Try: ENTER, clear, save, show, stats, quit, quiz N")


if __name__ == "__main__":
    main()
