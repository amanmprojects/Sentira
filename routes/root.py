from fastapi import APIRouter

router = APIRouter(tags=["root"])


@router.get("/")
async def root():
    return {
        "message": "Social Media Video Analysis API",
        "endpoints": {
            "/analyze-video": "POST - Upload a video for content summary"
        }
    }
