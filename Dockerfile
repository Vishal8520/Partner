# ==========================================
# Stage 1: Compile the React Vite Frontend
# ==========================================
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend

# Install dependencies first for Docker caching
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# Copy source and build static assets
COPY frontend/ ./
RUN npm run build

# ==========================================
# Stage 2: Serve using FastAPI Backend
# ==========================================
FROM python:3.10-slim
WORKDIR /app/backend

# Install python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend codebase
COPY backend/ ./

# Copy built frontend assets from Stage 1
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Expose port (Hugging Face Spaces default port is 7860, but Uvicorn binds dynamically)
EXPOSE 7860
ENV PORT=7860

# Run FastAPI backend uvicorn server
CMD ["python", "main.py"]
