# backend/media_api.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse, StreamingResponse
import os
import mimetypes
import magic
import asyncio
from typing import List, Dict

from auth import get_current_active_user, User # Assuming User model is defined in auth.py

router = APIRouter()

# Configuration for media root (can be loaded from .env or config file)
# This path is relative to the backend directory
# MEDIA_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../media"))
MEDIA_ROOT = os.path.abspath("/media/mcube/external/sorted_media")  # Change this to your actual media directory


def get_media_path(year: str, month: str, filename: str = None):
    """Constructs a secure path within the media root."""
    base_path = os.path.join(MEDIA_ROOT, year, month)
    if not os.path.exists(base_path):
        raise HTTPException(status_code=404, detail="Directory not found")

    if filename:
        file_path = os.path.join(base_path, filename)
        # Prevent path traversal
        if not os.path.commonprefix([os.path.realpath(file_path), os.path.realpath(base_path)]) == os.path.realpath(base_path):
            raise HTTPException(status_code=400, detail="Path traversal detected")
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found")
        return file_path
    return base_path

@router.get("/api/years", response_model=List[str])
async def get_years(current_user: User = Depends(get_current_active_user)):
    years = [d for d in os.listdir(MEDIA_ROOT) if os.path.isdir(os.path.join(MEDIA_ROOT, d))]
    return sorted(years, reverse=True)

@router.get("/api/months/{year}", response_model=List[str])
async def get_months(year: str, current_user: User = Depends(get_current_active_user)):
    year_path = os.path.join(MEDIA_ROOT, year)
    if not os.path.isdir(year_path):
        raise HTTPException(status_code=404, detail="Year not found")
    months = [d for d in os.listdir(year_path) if os.path.isdir(os.path.join(year_path, d))]
    return sorted(months)

@router.get("/api/media/{year}/{month}", response_model=List[Dict[str, str]])
async def get_media_files(year: str, month: str, current_user: User = Depends(get_current_active_user)):
    media_path = get_media_path(year, month)
    files = []
    for f in os.listdir(media_path):
        file_full_path = os.path.join(media_path, f)
        if os.path.isfile(file_full_path):
            mime_type = mimetypes.guess_type(file_full_path)[0]
            # Use python-magic for more accurate type detection if mimetypes fails
            if not mime_type:
                try:
                    mime_type = magic.from_file(file_full_path, mime=True)
                except Exception:
                    mime_type = "application/octet-stream" # Default if detection fails

            if mime_type and (mime_type.startswith("image/") or mime_type.startswith("video/")):
                files.append({
                    "filename": f,
                    "type": mime_type.split('/')[0],
                    "url": f"/media/{year}/{month}/{f}"
                })
    return sorted(files, key=lambda x: x['filename'])

@router.get("/media/{year}/{month}/{filename}")
async def serve_media(year: str, month: str, filename: str, current_user: User = Depends(get_current_active_user)):
    file_path = get_media_path(year, month, filename)
    mime_type = mimetypes.guess_type(file_path)[0]
    if not mime_type:
        try:
            mime_type = magic.from_file(file_path, mime=True)
        except Exception:
            mime_type = "application/octet-stream" # Default if detection fails

    # For video streaming, use StreamingResponse
    if mime_type and mime_type.startswith("video/"):
        async def file_iterator():
            async with asyncio.open(file_path, mode="rb") as f:
                while chunk := await f.read(65536):  # Read in 64KB chunks
                    yield chunk
        return StreamingResponse(file_iterator(), media_type=mime_type)
    else:
        return FileResponse(file_path, media_type=mime_type)


# Updated API routes for lazy-loading media files
@router.get("/api/media/tree")
async def get_tree(current_user: User = Depends(get_current_active_user)):
    """
    Get the year/month directory structure WITHOUT files.
    Files are loaded separately via /api/media/files/{year}/{month}
    """
    tree: List[Dict] = []
    years = [d for d in os.listdir(MEDIA_ROOT) if os.path.isdir(os.path.join(MEDIA_ROOT, d))]
    
    for year in sorted(years, reverse=True):
        year_path = os.path.join(MEDIA_ROOT, year)
        months = []
        
        for m in sorted(os.listdir(year_path)):
            month_path = os.path.join(year_path, m)
            if os.path.isdir(month_path):
                # Count files without loading them all into memory
                file_count = len([
                    f for f in os.listdir(month_path)
                    if os.path.isfile(os.path.join(month_path, f))
                ])
                
                months.append({
                    "dir": m,
                    "label": m.split("_", 1)[1] if "_" in m else m,
                    "file_count": file_count  # Just the count, not the actual files!
                })
        
        tree.append({"year": year, "months": months})
    
    return tree


@router.get("/api/media/files/{year}/{month}")
async def get_month_files(
    year: str, 
    month: str,
    current_user: User = Depends(get_current_active_user)
):
    """
    Get files for a specific year/month combination.
    Only called when user selects a month.
    """
    month_path = os.path.join(MEDIA_ROOT, year, month)
    
    # Security: Verify the path is within MEDIA_ROOT
    if not os.path.abspath(month_path).startswith(os.path.abspath(MEDIA_ROOT)):
        raise HTTPException(status_code=403, detail="Access denied")
    
    if not os.path.isdir(month_path):
        raise HTTPException(status_code=404, detail="Month not found")
    
    files = [
        f for f in os.listdir(month_path)
        if os.path.isfile(os.path.join(month_path, f))
    ]
    
    return {
        "year": year,
        "month": month,
        "files": sorted(files)  # Sort files alphabetically
    }