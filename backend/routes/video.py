from fastapi import APIRouter, File, UploadFile, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Optional
import os
import time
import httpx
import uuid
import cv2
import base64
import numpy as np

from config import client, DOWNLOADER_BASE_URL, model
from routes.fact_check import FactCheckReport
from services.fact_checker import FactChecker
from services.youtube_downloader import get_youtube_downloader

router = APIRouter(prefix="/analyze-video", tags=["video"])


class VideoAnalysis(BaseModel):
    """Simplified video content analysis with just a summary."""

    summary: str = Field(
        description="Detailed 3-4 sentence summary of the video content, including main message and context."
    )


# ==================== Structured Reel Analysis Models ====================


class Character(BaseModel):
    """A character/person detected in the video."""

    gender: Optional[str] = Field(
        default=None,
        description="Perceived gender of the character (male, female, or non-binary). If unclear, say 'Unknown'.",
    )
    race: Optional[str] = Field(
        default=None,
        description="Perceived race/ethnicity of the character (e.g., South Asian, East Asian, Caucasian, African, etc.). If unclear, say 'Unknown'.",
    )
    tone: Optional[str] = Field(
        default=None,
        description="The tone of voice or demeanor (e.g., sarcastic, serious, comedic, aggressive, friendly).",
    )
    facial_expression: Optional[str] = Field(
        default=None,
        description="Primary facial expression (e.g., smiling, frowning, neutral, angry, surprised).",
    )
    mood: Optional[str] = Field(
        default=None,
        description="Overall mood conveyed (e.g., happy, sad, anxious, excited, calm).",
    )
    notes: Optional[str] = Field(
        default=None,
        description="Any additional notes about the character (clothing, role in video, etc.).",
    )
    timestamp: Optional[float] = Field(
        default=None,
        description="Video timestamp (in seconds) when this character first appears or is most visible. Return as a decimal number (e.g., 2.5 or 10.3). IMPORTANT: Each character must have a DIFFERENT timestamp that shows THAT SPECIFIC PERSON most clearly.",
    )
    frame_image_b64: Optional[str] = Field(
        default=None,
        description="Base64-encoded image frame captured at the timestamp showing this character.",
    )


class ReelAnalysis(BaseModel):
    """Structured analysis of a short-form social media video (reel)."""

    main_summary: str = Field(
        description="A concise summary of the video's main topic or message in 2-3 sentences."
    )
    characters: list[Character] = Field(
        default_factory=list,
        description="List of characters/people appearing in the video with their attributes.",
    )
    commentary_summary: str = Field(
        description="A thorough 4-6 sentence explanation of the video's plot, narrative arc, and storyline. Describe what happens from beginning to end, including the setup, key events, any twist or punchline, and the conclusion. Include dialogue context, on-screen text, and how the story unfolds."
    )
    possible_issues: list[str] = Field(
        default_factory=list,
        description="List of potential content violations or sensitive topics detected (e.g., racism, homophobia, misogyny, casteism, islamophobia, hinduphobia, violence, hate speech). Do NOT include misinformation - that is handled by the fact-checker. Empty if none detected.",
    )
    transcript: Optional[str] = Field(
        default=None,
        description="Transcript of audio/speech in the video, if available. Include speaker labels if multiple speakers.",
    )
    suggestions: list[str] = Field(
        default_factory=list,
        description="Suggestions or observations about the content (e.g., context needed, fact-check recommendations, content warnings).",
    )


class EnhancedReelAnalysis(BaseModel):
    """Extended reel analysis with fact-checking using Google Search."""

    main_summary: str = Field(
        description="A concise summary of the video's main topic or message in 2-3 sentences."
    )
    characters: list[Character] = Field(
        default_factory=list,
        description="List of characters/people appearing in the video with their attributes.",
    )
    commentary_summary: str = Field(
        description="A thorough 4-6 sentence explanation of the video's plot, narrative arc, and storyline. Describe what happens from beginning to end, including the setup, key events, any twist or punchline, and the conclusion. Include dialogue context, on-screen text, and how the story unfolds."
    )
    possible_issues: list[str] = Field(
        default_factory=list,
        description="List of potential content violations or sensitive topics detected (e.g., racism, homophobia, misogyny, casteism, islamophobia, hinduphobia, violence, hate speech). Do NOT include misinformation - that is handled by the fact-checker. Empty if none detected.",
    )
    transcript: Optional[str] = Field(
        default=None,
        description="Transcript of audio/speech in the video, if available. Include speaker labels if multiple speakers.",
    )
    suggestions: list[str] = Field(
        default_factory=list,
        description="Suggestions or observations about the content (e.g., context needed, fact-check recommendations, content warnings).",
    )
    fact_check_report: Optional[FactCheckReport] = Field(
        default=None,
        description="Fact-check report with verified claims, sources, and overall truth score.",
    )
    overall_truth_score: Optional[float] = Field(
        default=None,
        description="Overall truthfulness score (0-1) from fact-checking. 1.0 means fully true.",
    )


class ReelAnalysisRequest(BaseModel):
    """Request body for reel analysis."""

    post_url: str = Field(description="The Instagram reel/post URL to analyze.")


class YouTubeAnalysisRequest(BaseModel):
    """Request body for YouTube video analysis."""

    video_url: str = Field(description="The YouTube video or Shorts URL to analyze.")


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
            detail="Only video files (mp4, mov, webm, avi) are supported.",
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
                status_code=500, detail=f"File processing failed. State: {myfile.state}"
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
            status_code=500, detail=f"Failed to analyze video: {str(e)}"
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
2. **characters**: List each DISTINCT person/character in the video with their:
   - gender (male, female, non-binary, or "Unknown" if unclear)
   - race (perceived ethnicity, or "Unknown" if unclear)
   - tone (sarcastic, serious, comedic, aggressive, friendly, etc.)
   - facial_expression (smiling, frowning, neutral, angry, surprised, etc.)
   - mood (happy, sad, anxious, excited, calm, etc.)
   - notes (clothing, role, any other observations that help distinguish this person)
   - timestamp (CRITICAL: A UNIQUE timestamp in seconds when THIS SPECIFIC CHARACTER is most clearly visible. Each character must have a DIFFERENT timestamp that shows THAT PARTICULAR PERSON, not just any person in the scene. Look for moments where the character's face is clearly visible and they are the focus. Use decimal format like 2.5 or 10.3.)

IMPORTANT CHARACTER IDENTIFICATION GUIDELINES:
- Treat each UNIQUE person as a separate character entry
- If you see the same person at different timestamps, identify them as ONE character by matching their visual appearance (clothing, hair, facial features, etc.)
- If different people appear in the video, create separate character entries for them
- Provide a timestamp where EACH INDIVIDUAL PERSON is clearly visible, NOT just random timestamps

3. **commentary_summary**: A thorough 8-10 sentence plot explanation. Describe the full narrative arc: what happens at the start, the key events or actions, any twist/punchline, and how it ends. Include dialogue context and on-screen text. Think of it as explaining the video's story to someone who hasn't seen it.
4. **possible_issues**: List any potential content violations or sensitive topics such as:
   - racism, homophobia, misogyny, casteism, islamophobia, hinduphobia
   - violence, hate speech, harassment
   - Leave empty if no issues detected.
   - IMPORTANT: Do NOT include misinformation claims here - misinformation is handled by a separate fact-checking system with real-time search capabilities.
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
                    detail=f"Failed to fetch video info from downloader: {downloader_response.text}",
                )

            video_data = downloader_response.json()

            if not video_data.get("success"):
                raise HTTPException(
                    status_code=400,
                    detail=f"Downloader error: {video_data.get('message', 'Unknown error')}",
                )

            # Get video URL from the response
            medias = video_data.get("data", {}).get("medias", [])
            if not medias:
                raise HTTPException(
                    status_code=400, detail="No video media found in the reel"
                )

            video_url = medias[0].get("url")
            if not video_url:
                raise HTTPException(
                    status_code=400, detail="Video URL not found in response"
                )

            # Step 2: Download the video
            video_response = await http_client.get(video_url)

            if video_response.status_code != 200:
                raise HTTPException(
                    status_code=500, detail="Failed to download video from Instagram"
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
                detail=f"Gemini file processing failed. State: {myfile.state}",
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

        # Step 4.5: Extract frame images for characters with timestamps
        analysis = await _extract_character_frames(analysis, temp_file_path)

        # Step 5: Fact-check using Google Search (if enabled)
        fact_check_report = None
        overall_truth_score = None

        if enable_fact_check:
            try:
                fact_checker = FactChecker(client)
                fact_check_report = fact_checker.fact_check_claims(
                    transcript=analysis.transcript or "",
                    analysis_summary=analysis.commentary_summary or "",
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
                    recommendations=[
                        "Fact-checking unavailable - review content manually"
                    ],
                )
                overall_truth_score = fact_check_report.overall_truth_score

        # Filter out misinformation-related issues since fact-checker handles those
        # This is a safety net in case the model still includes misinformation flags
        misinformation_keywords = [
            "misinformation",
            "false claim",
            "falsely claim",
            "fake news",
            "misleading claim",
        ]
        filtered_issues = [
            issue
            for issue in analysis.possible_issues
            if not any(keyword in issue.lower() for keyword in misinformation_keywords)
        ]

        # Return enhanced analysis
        return EnhancedReelAnalysis(
            main_summary=analysis.main_summary,
            characters=analysis.characters,
            commentary_summary=analysis.commentary_summary,
            possible_issues=filtered_issues,
            transcript=analysis.transcript,
            suggestions=analysis.suggestions,
            fact_check_report=fact_check_report,
            overall_truth_score=overall_truth_score,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze reel: {str(e)}")
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

    # ==================== Analyze YouTube Endpoint ====================

    """
    Analyze a YouTube video by URL and return structured analysis with optional fact-checking.

    This endpoint:
    1. Downloads the YouTube video using pytubefix
    2. Sends it to Gemini for structured analysis
    3. Optionally performs fact-checking using Google Search
    4. Returns detailed analysis including characters, issues, transcript, and fact-check results

    Query Parameters:
        enable_fact_check: Set to false to skip fact-checking (default: true)
    """

    myfile = None
    temp_file_path = None

    try:
        downloader = get_youtube_downloader()

        # Step 1: Download the YouTube video
        try:
            video_bytes, filename, metadata = downloader.download_video_bytes(
                request.video_url, max_quality="720p"
            )
        except Exception as e:
            raise HTTPException(
                status_code=400, detail=f"Failed to download YouTube video: {str(e)}"
            )

        # Step 2: Save to temp file
        temp_file_path = f"temp_youtube_{uuid.uuid4().hex}.mp4"
        with open(temp_file_path, "wb") as f:
            f.write(video_bytes)

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
                detail=f"Gemini file processing failed. State: {myfile.state}",
            )

        # Step 4: Analyze with Gemini
        response = client.models.generate_content(
            model=model,
            contents=[myfile, YOUTUBE_ANALYSIS_PROMPT],
            config={
                "response_mime_type": "application/json",
                "response_schema": ReelAnalysis,
            },
        )

        analysis = ReelAnalysis.model_validate_json(response.text)

        # Step 4.5: Extract frame images for characters with timestamps
        analysis = await _extract_character_frames(analysis, temp_file_path)

        # Step 5: Fact-check using Google Search (if enabled)
        fact_check_report = None
        overall_truth_score = None

        if enable_fact_check:
            try:
                fact_checker = FactChecker(client)
                fact_check_report = fact_checker.fact_check_claims(
                    transcript=analysis.transcript or "",
                    analysis_summary=analysis.commentary_summary or "",
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
                    recommendations=[
                        "Fact-checking unavailable - review content manually"
                    ],
                )
                overall_truth_score = fact_check_report.overall_truth_score

        # Filter out misinformation-related issues since fact-checker handles those
        misinformation_keywords = [
            "misinformation",
            "false claim",
            "falsely claim",
            "fake news",
            "misleading claim",
        ]
        filtered_issues = [
            issue
            for issue in analysis.possible_issues
            if not any(keyword in issue.lower() for keyword in misinformation_keywords)
        ]

        # Return enhanced analysis
        return EnhancedReelAnalysis(
            main_summary=analysis.main_summary,
            characters=analysis.characters,
            commentary_summary=analysis.commentary_summary,
            possible_issues=filtered_issues,
            transcript=analysis.transcript,
            suggestions=analysis.suggestions,
            fact_check_report=fact_check_report,
            overall_truth_score=overall_truth_score,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to analyze YouTube video: {str(e)}"
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


# ==================== Helper Functions ====================

# ==================== Helper Functions ====================


async def _extract_character_frames(
    analysis: ReelAnalysis, video_path: str
) -> ReelAnalysis:
    """Extract frame images for characters with timestamps from video."""
    if not analysis.characters or not os.path.exists(video_path):
        return analysis

    try:
        # Open video file
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            print(f"Failed to open video file: {video_path}")
            return analysis

        vid_fps = cap.get(cv2.CAP_PROP_FPS)
        if vid_fps <= 0:
            print(f"Invalid FPS: {vid_fps}")
            cap.release()
            return analysis

        # Extract frames for each character with a timestamp
        for char in analysis.characters:
            if char.timestamp is None:
                continue

            try:
                # Convert timestamp to frame number
                frame_num = int(char.timestamp * vid_fps)
                cap.set(cv2.CAP_PROP_POS_FRAMES, frame_num)

                # Read frame
                ret, frame = cap.read()
                if not ret:
                    continue

                # Get original dimensions
                height, width = frame.shape[:2]

                # Calculate new dimensions while maintaining aspect ratio
                # Set a target max dimension (e.g., 640)
                max_dim = 640
                if width > height:
                    new_width = max_dim
                    new_height = int(height * (max_dim / width))
                else:
                    new_height = max_dim
                    new_width = int(width * (max_dim / height))

                # Resize to better quality
                frame_resized = cv2.resize(
                    frame, (new_width, new_height), interpolation=cv2.INTER_LANCZOS4
                )

                # Convert to base64 with high quality (95%)
                _, buffer = cv2.imencode(
                    ".jpg", frame_resized, [cv2.IMWRITE_JPEG_QUALITY, 95]
                )
                frame_b64 = base64.b64encode(buffer).decode("utf-8")

            except Exception as e:
                print(
                    f"Failed to extract frame for character at {char.timestamp}s: {e}"
                )
                continue

        cap.release()
        return analysis

    except Exception as e:
        print(f"Failed to extract character frames: {e}")
