from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import video_router, root_router

app = FastAPI(title="Social Media Video Analysis API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(root_router)
app.include_router(video_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
