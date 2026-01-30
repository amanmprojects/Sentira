from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from pydantic import BaseModel, Field
import os
import time
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Social Media Video Analysis API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY environment variable is not set")

client = genai.Client(api_key=api_key)


class VideoAnalysis(BaseModel):
    """Simplified video content analysis with just a summary."""
    summary: str = Field(
        description="Detailed 3-4 sentence summary of the video content, including main message and context."
    )


@app.post("/analyze-video", response_model=VideoAnalysis)
async def analyze_video(video: UploadFile = File(...)):
    """
    Analyze a short-form video and return a summary.

    This endpoint processes short-form video content (reels, shorts) to provide:
    - Content summary
    """

    # Validate video file type
    if not video.filename.lower().endswith((".mp4", ".mov", ".webm", ".avi")):
        raise HTTPException(
            status_code=400,
            detail="Only video files (mp4, mov, webm, avi) are supported."
        )

    myfile = None
    temp_file_path = None
    try:
        # Save uploaded video temporarily
        temp_file_path = f"temp_{video.filename}"
        with open(temp_file_path, "wb") as buffer:
            content = await video.read()
            buffer.write(content)

        # Upload video to Gemini
        myfile = client.files.upload(file=temp_file_path)

        # Wait for file to be processed (active state)
        max_wait = 120  # 2 minutes
        waited = 0
        while myfile.state == "PROCESSING" and waited < max_wait:
            time.sleep(2)
            myfile = client.files.get(name=myfile.name)
            waited += 2

        if myfile.state != "ACTIVE":
            raise HTTPException(
                status_code=500,
                detail=f"File processing failed. State: {myfile.state}"
            )

        prompt = """
        Provide a detailed 3-4 sentence summary of this short-form social media video.
        Include the main message and context of the content.
        """

        response = client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=[myfile, prompt],
            config={
                "response_mime_type": "application/json",
                "response_json_schema": VideoAnalysis.model_json_schema(),
            },
        )

        analysis = VideoAnalysis.model_validate_json(response.text)
        return analysis

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze video: {str(e)}"
        )
    finally:
        # Clean up uploaded file from Gemini if it exists
        try:
            if myfile:
                client.files.delete(name=myfile.name)
        except Exception:
            pass

        # Clean up local temp file if it exists
        try:
            if temp_file_path and os.path.exists(temp_file_path):
                os.remove(temp_file_path)
        except Exception:
            pass


@app.get("/")
async def root():
    return {
        "message": "Social Media Video Analysis API",
        "endpoints": {
            "/analyze-video": "POST - Upload a video for content summary"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)