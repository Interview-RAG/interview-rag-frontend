// Single source of truth for the backend URL.
//
// Dev deliberately uses 127.0.0.1 rather than localhost: Windows resolves
// `localhost` to ::1 first, and Docker Desktop / WSL relay commonly hold
// [::1]:8000, so `localhost:8000` can silently reach a different server than
// the uvicorn bound to 127.0.0.1:8000.
export const API_BASE = import.meta.env.DEV
  ? 'http://127.0.0.1:8000/api'
  : 'https://interview-rag-backend.onrender.com/api';
