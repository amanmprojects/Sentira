from .video import router as video_router
from .root import router as root_router
from .videos import router as videos_router

__all__ = ["video_router", "root_router", "videos_router"]
