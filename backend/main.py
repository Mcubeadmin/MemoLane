from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
import os
import mimetypes
import magic
import asyncio
from pathlib import Path

from auth import router as auth_router, get_current_active_user, User
from media_api import router as media_router, MEDIA_ROOT

app = FastAPI()

# CORS middleware to allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to your frontend's origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(media_router)

# Serve static files from the frontend build directory
# This will be configured once the frontend is built
FRONTEND_DIST_DIR = Path(__file__).parent.parent / "frontend" / "dist"

@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    if full_path == "" or "." not in full_path: # Serve index.html for root and client-side routes
        full_path = "index.html"
    file_path = FRONTEND_DIST_DIR / full_path
    if file_path.is_file():
        return FileResponse(file_path)
    raise HTTPException(status_code=404, detail="Not Found")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)