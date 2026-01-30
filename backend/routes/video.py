from fastapi import APIRouter, File, UploadFile, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
import os
import time
import httpx
import uuid

from config import client, DOWNLOADER_BASE_URL, model
from routes.fact_check import FactCheckReport
from services.fact_checker import FactChecker

router = APIRouter(prefix="/analyze-video", tags=["video"])


class VideoAnalysis(BaseModel):
    """Simplified video content analysis with just a summary."""
    summary: str = Field(
        description="Detailed 3-4 sentence summary of the video content, including main message and context."
    )


# ==================== Structured Reel Analysis Models ====================

class Character(BaseModel):
    """A character/person detected in the video."""
    race: Optional[str] = Field(
        default=None,
        description="Perceived race/ethnicity of the character (e.g., South Asian, East Asian, Caucasian, African, etc.). If unclear, say 'Unknown'."
    )
    tone: Optional[str] = Field(
        default=None,
        description="The tone of voice or demeanor (e.g., sarcastic, serious, comedic, aggressive, friendly)."
    )
    facial_expression: Optional[str] = Field(
        default=None,
        description="Primary facial expression (e.g., smiling, frowning, neutral, angry, surprised)."
    )
    mood: Optional[str] = Field(
        default=None,
        description="Overall mood conveyed (e.g., happy, sad, anxious, excited, calm)."
    )
    notes: Optional[str] = Field(
        default=None,
        description="Any additional notes about the character (clothing, role in video, etc.)."
    )


class ReelAnalysis(BaseModel):
    """Structured analysis of a short-form social media video (reel)."""
    main_summary: str = Field(
        description="A concise summary of the video's main topic or message in 2-3 sentences."
    )
    characters: list[Character] = Field(
        default_factory=list,
        description="List of characters/people appearing in the video with their attributes."
    )
    commentary_summary: str = Field(
        description="A thorough 4-6 sentence explanation of the video's plot, narrative arc, and storyline. Describe what happens from beginning to end, including the setup, key events, any twist or punchline, and the conclusion. Include dialogue context, on-screen text, and how the story unfolds."
    )
    possible_issues: list[str] = Field(
        default_factory=list,
        description="List of potential content violations or sensitive topics detected (e.g., racism, homophobia, misogyny, casteism, islamophobia, hinduphobia, violence, hate speech, misinformation). Empty if none detected."
    )
    transcript: Optional[str] = Field(
        default=None,
        description="Transcript of audio/speech in the video, if available. Include speaker labels if multiple speakers."
    )
    suggestions: list[str] = Field(
        default_factory=list,
        description="Suggestions or observations about the content (e.g., context needed, fact-check recommendations, content warnings)."
    )


class EnhancedReelAnalysis(BaseModel):
    """Extended reel analysis with fact-checking using Google Search."""
    main_summary: str = Field(
        description="A concise summary of the video's main topic or message in 2-3 sentences."
    )
    characters: list[Character] = Field(
        default_factory=list,
        description="List of characters/people appearing in the video with their attributes."
    )
    commentary_summary: str = Field(
        description="A thorough 4-6 sentence explanation of the video's plot, narrative arc, and storyline. Describe what happens from beginning to end, including the setup, key events, any twist or punchline, and the conclusion. Include dialogue context, on-screen text, and how the story unfolds."
    )
    possible_issues: list[str] = Field(
        default_factory=list,
        description="List of potential content violations or sensitive topics detected (e.g., racism, homophobia, misogyny, casteism, islamophobia, hinduphobia, violence, hate speech, misinformation). Empty if none detected."
    )
    transcript: Optional[str] = Field(
        default=None,
        description="Transcript of audio/speech in the video, if available. Include speaker labels if multiple speakers."
    )
    suggestions: list[str] = Field(
        default_factory=list,
        description="Suggestions or observations about the content (e.g., context needed, fact-check recommendations, content warnings)."
    )
    fact_check_report: Optional[FactCheckReport] = Field(
        default=None,
        description="Fact-check report with verified claims, sources, and overall truth score."
    )
    overall_truth_score: Optional[float] = Field(
        default=None,
        description="Overall truthfulness score (0-1) from fact-checking. 1.0 means fully true."
    )


class ReelAnalysisRequest(BaseModel):
    """Request body for reel analysis."""
    post_url: str = Field(
        description="The Instagram reel/post URL to analyze."
    )


@router.post("", response_model=VideoAnalysis)
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
            model=model,
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


# ==================== Analyze Reel Endpoint ====================

REEL_ANALYSIS_PROMPT = """
Analyze this short-form social media video (Instagram reel) and provide a structured analysis.

You must provide:
1. **main_summary**: A concise 2-3 sentence summary of the video's main topic/message.
2. **characters**: List each person/character in the video with their:
   - race (perceived ethnicity, or "Unknown" if unclear)
   - tone (sarcastic, serious, comedic, aggressive, friendly, etc.)
   - facial_expression (smiling, frowning, neutral, angry, surprised, etc.)
   - mood (happy, sad, anxious, excited, calm, etc.)
   - notes (clothing, role, any other observations)
3. **commentary_summary**: A thorough 8-10 sentence plot explanation. Describe the full narrative arc: what happens at the start, the key events or actions, any twist/punchline, and how it ends. Include dialogue context and on-screen text. Think of it as explaining the video's story to someone who hasn't seen it.
4. **possible_issues**: List any potential content violations or sensitive topics such as:
   - racism, homophobia, misogyny, casteism, islamophobia, hinduphobia
   - violence, hate speech, misinformation, harassment
   - Leave empty if no issues detected.
5. **transcript**: Transcribe all speech/audio in the video. Include speaker labels if multiple speakers.
6. **suggestions**: Any observations, context needed, fact-check recommendations, or content warnings.

Be thorough but objective. Do not make assumptions without evidence from the video.
"""


@router.post("/reel", response_model=EnhancedReelAnalysis)
async def analyze_reel(request: ReelAnalysisRequest, enable_fact_check: bool = True):
    """
    Analyze an Instagram reel by URL and return structured analysis with optional fact-checking.

    This endpoint:
    1. Fetches video info from the Instagram downloader service
    2. Downloads the video
    3. Sends it to Gemini for structured analysis
    4. Optionally performs fact-checking using Google Search
    5. Returns detailed analysis including characters, issues, transcript, and fact-check results

    Query Parameters:
        enable_fact_check: Set to false to skip fact-checking (default: true)
    """

    myfile = None
    temp_file_path = None

    try:
        # Step 1: Get video info from downloader service
        async with httpx.AsyncClient(timeout=60.0) as http_client:
            downloader_url = f"{DOWNLOADER_BASE_URL}/api/video"
            params = {"postUrl": request.post_url, "enhanced": "true"}

            downloader_response = await http_client.get(downloader_url, params=params)

            if downloader_response.status_code != 200:
                raise HTTPException(
                    status_code=downloader_response.status_code,
                    detail=f"Failed to fetch video info from downloader: {downloader_response.text}"
                )

            video_data = downloader_response.json()

            if not video_data.get("success"):
                raise HTTPException(
                    status_code=400,
                    detail=f"Downloader error: {video_data.get('message', 'Unknown error')}"
                )

            # Get video URL from the response
            medias = video_data.get("data", {}).get("medias", [])
            if not medias:
                raise HTTPException(
                    status_code=400,
                    detail="No video media found in the reel"
                )

            video_url = medias[0].get("url")
            if not video_url:
                raise HTTPException(
                    status_code=400,
                    detail="Video URL not found in response"
                )

            # Step 2: Download the video
            video_response = await http_client.get(video_url)

            if video_response.status_code != 200:
                raise HTTPException(
                    status_code=500,
                    detail="Failed to download video from Instagram"
                )

            # Save to temp file
            temp_file_path = f"temp_reel_{uuid.uuid4().hex}.mp4"
            with open(temp_file_path, "wb") as f:
                f.write(video_response.content)

        # Step 3: Upload to Gemini
        myfile = client.files.upload(file=temp_file_path)

        # Wait for file to be processed
        max_wait = 120
        waited = 0
        while myfile.state == "PROCESSING" and waited < max_wait:
            time.sleep(2)
            myfile = client.files.get(name=myfile.name)
            waited += 2

        if myfile.state != "ACTIVE":
            raise HTTPException(
                status_code=500,
                detail=f"Gemini file processing failed. State: {myfile.state}"
            )

        # Step 4: Analyze with Gemini
        response = client.models.generate_content(
            model=model,
            contents=[myfile, REEL_ANALYSIS_PROMPT],
            config={
                "response_mime_type": "application/json",
                "response_schema": ReelAnalysis,
            },
        )

        analysis = ReelAnalysis.model_validate_json(response.text)

        # Step 5: Fact-check using Google Search (if enabled)
        fact_check_report = None
        overall_truth_score = None

        if enable_fact_check:
            try:
                fact_checker = FactChecker(client)
                fact_check_report = fact_checker.fact_check_claims(
                    transcript=analysis.transcript or "",
                    analysis_summary=analysis.commentary_summary or ""
                )
                overall_truth_score = fact_check_report.overall_truth_score
            except Exception as fact_check_error:
                # Log the error but don't fail the entire request
                print(f"Fact-checking failed: {fact_check_error}")
                # Create a fallback report
                fact_check_report = FactCheckReport(
                    claims_detected=[],
                    overall_truth_score=0.8,
                    content_harmfulness="low",
                    recommendations=["Fact-checking unavailable - review content manually"]
                )
                overall_truth_score = fact_check_report.overall_truth_score

        # Return enhanced analysis
        return EnhancedReelAnalysis(
            main_summary=analysis.main_summary,
            characters=analysis.characters,
            commentary_summary=analysis.commentary_summary,
            possible_issues=analysis.possible_issues,
            transcript=analysis.transcript,
            suggestions=analysis.suggestions,
            fact_check_report=fact_check_report,
            overall_truth_score=overall_truth_score
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze reel: {str(e)}"
        )
    finally:
        # Clean up Gemini file
        try:
            if myfile:
                client.files.delete(name=myfile.name)
        except Exception:
            pass

        # Clean up temp file
        try:
            if temp_file_path and os.path.exists(temp_file_path):
                os.remove(temp_file_path)
        except Exception:
            pass
