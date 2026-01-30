from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path
from config import VIDEOS_DIR
import os

router = APIRouter(prefix="/videos", tags=["videos"])


@router.get("/{filename}")
async def get_video(filename: str):
    """Serve a video file from the videos directory."""
    video_path = VIDEOS_DIR / filename

    if not video_path.exists():
        raise HTTPException(status_code=404, detail="Video not found")

    # Validate the file is a video
    valid_extensions = {".mp4", ".mov", ".webm", ".avi"}
    if video_path.suffix.lower() not in valid_extensions:
        raise HTTPException(status_code=400, detail="Invalid video file")

    # Get file size for Content-Length header
    file_size = video_path.stat().st_size

    return FileResponse(
        video_path,
        media_type="video/mp4",
        headers={
            "Content-Length": str(file_size),
            "Accept-Ranges": "bytes",
        },
    )


@router.delete("/{filename}")
async def delete_video(filename: str):
    """Delete a video file from the videos directory."""
    video_path = VIDEOS_DIR / filename

    if not video_path.exists():
        raise HTTPException(status_code=404, detail="Video not found")

    try:
        os.remove(video_path)
        return {"message": f"Video {filename} deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete video: {str(e)}")
