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
import asyncio
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))

from config import client, DOWNLOADER_BASE_URL, model, VIDEOS_DIR
from routes.fact_check import FactCheckReport
from services.fact_checker import FactChecker
from services.youtube_downloader import get_youtube_downloader
from cache import get_cache

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


# ==================== Split Analysis Models for Faster Processing ====================


class TranscriptAnalysis(BaseModel):
    """Fast transcript and summary analysis (text-focused)."""

    transcript: Optional[str] = Field(
        default=None,
        description="Full transcription of all speech with timestamp markers [MM:SS].",
    )
    main_summary: str = Field(
        description="2-3 sentence summary of the video's main topic/message.",
    )
    commentary_summary: str = Field(
        description="8-10 sentence narrative arc describing the full story.",
    )
    possible_issues: list[str] = Field(
        default_factory=list,
        description="Content violations (racism, hate speech, etc.).",
    )


class CharacterAttributes(BaseModel):
    """Character attributes from vision analysis."""

    gender: Optional[str] = None
    race: Optional[str] = None
    tone: Optional[str] = None
    facial_expression: Optional[str] = None
    mood: Optional[str] = None
    notes: Optional[str] = None
    timestamp: Optional[float] = None
    frame_image_b64: Optional[str] = None


class CharacterAnalysis(BaseModel):
    """Character analysis from video (vision-focused)."""

    characters: list[CharacterAttributes] = Field(
        default_factory=list,
        description="List of characters with their attributes.",
    )


class EmotionSegment(BaseModel):
    """An emotion segment in the timeline."""

    emotion: str = Field(
        description="Emotion name: Anger, Disgust, Horror, Humor, Sadness, or Surprise"
    )
    start: float = Field(description="Start time in seconds")
    end: float = Field(description="End time in seconds")
    intensity: float = Field(description="Emotion intensity 0.0-1.0", ge=0.0, le=1.0)


class CharacterEmotion(BaseModel):
    """Character emotion data."""

    id: str = Field(description="Character ID")
    name: str = Field(description="Character name")
    dominant_emotion: str = Field(
        description="Dominant emotion: Anger, Disgust, Horror, Humor, Sadness, or Surprise"
    )
    volatility: str = Field(description="Emotion volatility: Low, Medium, or High")
    screen_time: float = Field(
        description="Percentage of screen time 0.0-100.0", ge=0.0, le=100.0
    )


class EmotionSeismograph(BaseModel):
    """Seismograph data with intensity arrays for each emotion."""

    Anger: list[float] = Field(
        default_factory=list, description="Anger intensity array"
    )
    Disgust: list[float] = Field(
        default_factory=list, description="Disgust intensity array"
    )
    Horror: list[float] = Field(
        default_factory=list, description="Horror intensity array"
    )
    Humor: list[float] = Field(
        default_factory=list, description="Humor intensity array"
    )
    Sadness: list[float] = Field(
        default_factory=list, description="Sadness intensity array"
    )
    Surprise: list[float] = Field(
        default_factory=list, description="Surprise intensity array"
    )


class SentimentAnalysis(BaseModel):
    """Emotion and sentiment analysis from video."""

    emotion_timeline: list[EmotionSegment] = Field(
        description="List of emotion segments with time and intensity",
    )
    emotion_seismograph: EmotionSeismograph = Field(
        default_factory=EmotionSeismograph,
        description="Per-emotion intensity arrays for visualization",
    )
    character_emotions: list[CharacterEmotion] = Field(
        description="Per-character emotion data (id, name, dominant_emotion, volatility, screen_time)",
    )
    global_category: str = Field(
        description="Overall sentiment category, e.g., Positive/Alert, Negative/Concerning",
    )
    confidence_score: float = Field(
        description="Analysis confidence 0.0-1.0", ge=0.0, le=1.0
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

# ==================== Structured Reel Analysis Prompts ====================

# OPTIMIZED: Split prompts for parallel analysis (50% faster)

TRANSCRIPT_ANALYSIS_PROMPT = """
Analyze this short-form video and provide:

1. transcript: Full transcription of all speech with timestamp markers [MM:SS] where each line shows the time
2. main_summary: 2-3 sentence summary of the video's main topic/message
3. commentary_summary: 8-10 sentence narrative arc describing the full story from beginning to end, including setup, key events, twist/punchline, conclusion, dialogue, and on-screen text
4. possible_issues: List any content violations (racism, homophobia, misogyny, casteism, islamophobia, hinduphobia, violence, hate speech). Leave empty if none.

Focus on text and speech. Do not analyze characters in detail - that's a separate task.
"""

CHARACTER_ANALYSIS_PROMPT = """
Analyze this video for character/person analysis ONLY.

For each DISTINCT person in the video:
- gender (male, female, non-binary, or "Unknown")
- race/ethnicity (South Asian, East Asian, Caucasian, African, or "Unknown")
- tone (sarcastic, serious, comedic, aggressive, friendly)
- facial_expression (smiling, frowning, neutral, angry, surprised)
- mood (happy, sad, anxious, excited, calm)
- notes (clothing, role, distinguishing features)
- timestamp (UNIQUE seconds when THIS SPECIFIC person is most visible. Each person needs a different timestamp)

Return a list of characters with these attributes.
"""

SENTIMENT_ANALYSIS_PROMPT = """
Analyze emotion and sentiment across this video per-second granularity.

For each 2-3 second segment of the video:
- Identify the dominant emotion: Anger, Disgust, Horror, Humor, Sadness, or Surprise
- Assign intensity level (0.0-1.0, where 1.0 is very strong)
- Note the start and end times in seconds

For each character/person detected:
- id: Unique identifier (e.g., char1, char2)
- name: Brief name/description (e.g., "Person in blue", "Speaker")
- dominant_emotion: The emotion they show most (Anger, Disgust, Horror, Humor, Sadness, or Surprise)
- volatility: How much their emotion changes (Low, Medium, or High)
- screen_time: Percentage of video they appear (0.0-100.0)

Provide:
- emotion_timeline: List of [{emotion, start, end, intensity}] segments
- emotion_seismograph: Dictionary with 6 emotions as keys (Anger, Disgust, Horror, Humor, Sadness, Surprise), each containing an array of ~100 intensity values (0.0-1.0) representing intensity across the video timeline
- character_emotions: List of [{id, name, dominant_emotion, volatility, screen_time}]
- global_category: e.g., "Positive/Alert", "Negative/Concerning", "Neutral/Mixed"
- confidence_score: 0.0-1.0 (how confident you are in the analysis)

Be precise with timestamps and match visual signals to emotions.
"""


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
async def analyze_reel(request: ReelAnalysisRequest, enable_fact_check: bool = False):
    """
    Analyze an Instagram reel by URL with PARALLEL LLM calls for 50% faster results.

    This endpoint:
    1. Checks cache for existing analysis
    2. Fetches video info from downloader service
    3. Downloads and uploads to Gemini
    4. Runs transcript and character analysis IN PARALLEL
    5. Extracts frames concurrently
    6. Optionally performs fact-checking
    7. Caches result for future requests

    Query Parameters:
        enable_fact_check: Set to false to skip fact-checking (default: false for speed)
    """

    # Check cache first
    cache = get_cache()
    if cached := cache.get(request.post_url):
        # If fact-check requested but not in cache, re-run fact-check on cached result
        if enable_fact_check and not cached.fact_check_report:
            try:
                fact_checker = FactChecker(client)
                fact_check_report = fact_checker.fact_check_claims(
                    transcript=cached.transcript or "",
                    analysis_summary=cached.commentary_summary or "",
                )
                cached.fact_check_report = fact_check_report
                cached.overall_truth_score = fact_check_report.overall_truth_score
                # Update cache with fact-checked result
                cache.set(request.post_url, cached)
            except Exception as fact_check_error:
                print(f"Fact-checking failed: {fact_check_error}")
        return cached

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

        # Wait for file to be processed (optimized: 1s intervals, 60s max)
        max_wait = 60
        waited = 0
        poll_interval = 1
        while myfile.state == "PROCESSING" and waited < max_wait:
            await asyncio.sleep(poll_interval)
            myfile = client.files.get(name=myfile.name)
            waited += poll_interval

        if myfile.state != "ACTIVE":
            raise HTTPException(
                status_code=500,
                detail=f"Gemini file processing failed. State: {myfile.state}",
            )

        # Step 4: PARALLEL ANALYSIS (split into 2 concurrent calls for 50% speedup)
        async def analyze_transcript_faster() -> TranscriptAnalysis:
            """Fast transcript analysis (text-focused)."""
            response = client.models.generate_content(
                model=model,
                contents=[myfile, TRANSCRIPT_ANALYSIS_PROMPT],
                config={
                    "response_mime_type": "application/json",
                    "response_schema": TranscriptAnalysis,
                },
            )
            return TranscriptAnalysis.model_validate_json(response.text)

        async def analyze_characters_faster() -> CharacterAnalysis:
            """Fast character analysis (vision-focused)."""
            response = client.models.generate_content(
                model=model,
                contents=[myfile, CHARACTER_ANALYSIS_PROMPT],
                config={
                    "response_mime_type": "application/json",
                    "response_schema": CharacterAnalysis,
                },
            )
            return CharacterAnalysis.model_validate_json(response.text)

        # Run both analyses in parallel
        transcript_result, character_result = await asyncio.gather(
            analyze_transcript_faster(), analyze_characters_faster()
        )

        # Step 5: Combine results into EnhancedReelAnalysis
        analysis = EnhancedReelAnalysis(
            main_summary=transcript_result.main_summary,
            commentary_summary=transcript_result.commentary_summary,
            possible_issues=transcript_result.possible_issues,
            transcript=transcript_result.transcript,
            characters=[
                Character(**attr.model_dump()) for attr in character_result.characters
            ],
            suggestions=[],
            fact_check_report=None,
            overall_truth_score=None,
        )

        # Step 6: Extract frames PARALLELY (much faster)
        analysis = await _extract_character_frames(analysis, temp_file_path)

        # Step 7: Optional fact-check (disabled by default for speed)
        if enable_fact_check:
            try:
                fact_checker = FactChecker(client)
                fact_check_report = fact_checker.fact_check_claims(
                    transcript=analysis.transcript or "",
                    analysis_summary=analysis.commentary_summary or "",
                )
                analysis.fact_check_report = fact_check_report
                analysis.overall_truth_score = fact_check_report.overall_truth_score
            except Exception as fact_check_error:
                print(f"Fact-checking failed: {fact_check_error}")
                # Don't fail the whole request, just skip fact-check
                pass

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
        analysis.possible_issues = filtered_issues

        # Cache result before returning
        cache.set(request.post_url, analysis)

        return analysis

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

        # Wait for file to be processed (optimized: 1s intervals, 60s max)
        max_wait = 60
        waited = 0
        poll_interval = 1
        while myfile.state == "PROCESSING" and waited < max_wait:
            await asyncio.sleep(poll_interval)
            myfile = client.files.get(name=myfile.name)
            waited += poll_interval

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


def _generate_seismograph_arrays(
    emotion_timeline: list[dict], duration: float
) -> dict[str, list[float]]:
    """
    Convert emotion timeline into seismograph arrays for visualization.

    Creates ~100 data points (one per ~1% of video) for smooth visualization.
    Interpolates between timeline segments.

    Args:
        emotion_timeline: List of {emotion, start, end, intensity} segments
        duration: Total video duration in seconds

    Returns:
        Dictionary mapping emotion names to arrays of 100 intensity values (0.0-1.0)
    """
    emotions = ["Anger", "Disgust", "Horror", "Humor", "Sadness", "Surprise"]
    seismograph = {emotion: [0.0] * 100 for emotion in emotions}

    for segment in emotion_timeline:
        emotion = segment.get("emotion", "Unknown")
        if emotion not in emotions:
            continue

        start = segment.get("start", 0)
        end = segment.get("end", 0)
        intensity = segment.get("intensity", 0.5)

        # Map time to array indices (0-99)
        if duration > 0:
            start_idx = int((start / duration) * 100)
            end_idx = int((end / duration) * 100)

            # Fill array range with intensity
            for i in range(start_idx, min(end_idx, 100)):
                if 0 <= i < 100:
                    seismograph[emotion][i] = intensity

    return seismograph


async def _extract_character_frames(
    analysis: EnhancedReelAnalysis, video_path: str
) -> EnhancedReelAnalysis:
    """Extract frame images for characters with timestamps from video (PARALLEL)."""
    if not analysis.characters or not os.path.exists(video_path):
        return analysis

    try:
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            print(f"Failed to open video file: {video_path}")
            return analysis

        vid_fps = cap.get(cv2.CAP_PROP_FPS)
        if vid_fps <= 0:
            print(f"Invalid FPS: {vid_fps}")
            cap.release()
            return analysis

        # Extract frames PARALLELY
        async def extract_frame_for_char(char: Character) -> Character:
            if char.timestamp is None:
                return char

            try:
                frame_num = int(char.timestamp * vid_fps)
                cap.set(cv2.CAP_PROP_POS_FRAMES, frame_num)
                ret, frame = cap.read()
                if not ret:
                    return char

                # Resize to 500px (good balance between quality and speed)
                height, width = frame.shape[:2]
                max_dim = 500
                if width > height:
                    new_width = max_dim
                    new_height = int(height * (max_dim / width))
                else:
                    new_height = max_dim
                    new_width = int(width * (height / max_dim))

                frame_resized = cv2.resize(
                    frame, (new_width, new_height), interpolation=cv2.INTER_LANCZOS4
                )

                # 85% quality (good balance)
                _, buffer = cv2.imencode(
                    ".jpg", frame_resized, [cv2.IMWRITE_JPEG_QUALITY, 85]
                )
                char.frame_image_b64 = base64.b64encode(buffer).decode("utf-8")
                return char
            except Exception as e:
                print(f"Failed to extract frame for char at {char.timestamp}s: {e}")
                return char

        # Run all extractions in parallel
        analysis.characters = await asyncio.gather(
            *[extract_frame_for_char(char) for char in analysis.characters]
        )

        cap.release()
        return analysis

    except Exception as e:
        print(f"Failed to extract character frames: {e}")
        return analysis

    try:
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            print(f"Failed to open video file: {video_path}")
            return analysis

        vid_fps = cap.get(cv2.CAP_PROP_FPS)
        if vid_fps <= 0:
            print(f"Invalid FPS: {vid_fps}")
            cap.release()
            return analysis

        # Extract frames PARALLELY
        async def extract_frame_for_char(char: Character) -> Character:
            if char.timestamp is None:
                return char

            try:
                frame_num = int(char.timestamp * vid_fps)
                cap.set(cv2.CAP_PROP_POS_FRAMES, frame_num)
                ret, frame = cap.read()
                if not ret:
                    return char

                # Resize to 500px (good balance between quality and speed)
                height, width = frame.shape[:2]
                max_dim = 500
                if width > height:
                    new_width = max_dim
                    new_height = int(height * (max_dim / width))
                else:
                    new_height = max_dim
                    new_width = int(width * (height / max_dim))

                frame_resized = cv2.resize(
                    frame, (new_width, new_height), interpolation=cv2.INTER_LANCZOS4
                )

                # 85% quality (good balance)
                _, buffer = cv2.imencode(
                    ".jpg", frame_resized, [cv2.IMWRITE_JPEG_QUALITY, 85]
                )
                char.frame_image_b64 = base64.b64encode(buffer).decode("utf-8")
                return char
            except Exception as e:
                print(f"Failed to extract frame for char at {char.timestamp}s: {e}")
                return char

        # Run all extractions in parallel
        analysis.characters = await asyncio.gather(
            *[extract_frame_for_char(char) for char in analysis.characters]
        )

        cap.release()
        return analysis

    except Exception as e:
        print(f"Failed to extract character frames: {e}")
        return analysis


# ==================== Sentiment Analysis Endpoint ====================


@router.post("/sentiment")
async def analyze_sentiment_url(request: ReelAnalysisRequest):
    """
    Dedicated sentiment/emotion analysis endpoint with per-second granularity.
    Supports both Instagram and YouTube URLs for comprehensive emotion tracking.

    This endpoint:
    1. Detects platform (Instagram/YouTube)
    2. Downloads video
    3. Analyzes emotions per 2-3 second segment
    4. Generates seismograph data for visualization
    5. Returns character-level emotion analysis

    Returns:
        SentimentAnalysis with timeline, seismographs, and character emotions
    """
    cache = get_cache()

    # Check cache for sentiment analysis
    if cached := cache.get(f"sentiment:{request.post_url}"):
        return cached

    myfile = None
    temp_file_path = None
    video_duration = 30

    try:
        # Detect platform and download
        post_url = request.post_url
        is_youtube = "youtube.com" in post_url or "youtu.be" in post_url

        if is_youtube:
            # YouTube download
            downloader = get_youtube_downloader()
            video_bytes, filename, metadata = downloader.download_video_bytes(
                post_url, max_quality="720p"
            )
            video_duration = metadata.get("length", 30)
            temp_file_path = f"temp_youtube_{uuid.uuid4().hex}.mp4"
            with open(temp_file_path, "wb") as f:
                f.write(video_bytes)
        else:
            # Instagram download
            async with httpx.AsyncClient(timeout=60.0) as http_client:
                downloader_url = f"{DOWNLOADER_BASE_URL}/api/video"
                response = await http_client.get(
                    downloader_url, params={"postUrl": post_url, "enhanced": "true"}
                )
                video_data = response.json()
                medias = video_data.get("data", {}).get("medias", [])

                if not medias:
                    raise HTTPException(status_code=400, detail="No video media found")

                video_url = medias[0].get("url")
                video_response = await http_client.get(video_url)

                temp_file_path = f"temp_reel_{uuid.uuid4().hex}.mp4"
                with open(temp_file_path, "wb") as f:
                    f.write(video_response.content)

                # Get actual video duration using cv2
                import cv2

                cap = cv2.VideoCapture(temp_file_path)
                video_duration = (
                    int(cap.get(cv2.CAP_PROP_FRAME_COUNT) / cap.get(cv2.CAP_PROP_FPS))
                    * 1000
                    / 1000
                )
                cap.release()

        # Upload to Gemini
        myfile = client.files.upload(file=temp_file_path)

        # Wait for processing (optimized: 1s intervals, 60s max)
        max_wait = 60
        waited = 0
        poll_interval = 1
        while myfile.state == "PROCESSING" and waited < max_wait:
            await asyncio.sleep(poll_interval)
            myfile = client.files.get(name=myfile.name)
            waited += poll_interval

        if myfile.state != "ACTIVE":
            raise HTTPException(
                status_code=500, detail=f"File processing failed: {myfile.state}"
            )

        # Run sentiment analysis
        response = client.models.generate_content(
            model=model,
            contents=[myfile, SENTIMENT_ANALYSIS_PROMPT],
            config={
                "response_mime_type": "application/json",
                "response_schema": SentimentAnalysis,
            },
        )

        sentiment_result = SentimentAnalysis.model_validate_json(response.text)

        # Build transcript segments with emotions for UI
        transcript_segments = [
            {
                "id": i,
                "start": seg.start,
                "end": seg.end,
                "text": f"[{seg.start:.0f}s-{seg.end:.0f}s] {seg.emotion} emotion (intensity: {seg.intensity:.2f})",
                "emotion": seg.emotion,
            }
            for i, seg in enumerate(sentiment_result.emotion_timeline)
        ]

        # Generate seismograph arrays if not provided or empty
        if not sentiment_result.emotion_seismograph or not any(
            getattr(sentiment_result.emotion_seismograph, emotion)
            for emotion in [
                "Anger",
                "Disgust",
                "Horror",
                "Humor",
                "Sadness",
                "Surprise",
            ]
        ):
            timeline_dicts = [
                {
                    "emotion": seg.emotion,
                    "start": seg.start,
                    "end": seg.end,
                    "intensity": seg.intensity,
                }
                for seg in sentiment_result.emotion_timeline
            ]
            seismograph = _generate_seismograph_arrays(timeline_dicts, video_duration)
        else:
            seismograph = sentiment_result.emotion_seismograph.model_dump()

        # Save video to persistent storage for frontend playback
        import hashlib

        url_hash = hashlib.md5(request.post_url.encode()).hexdigest()
        video_filename = f"video_{url_hash}.mp4"
        persistent_video_path = VIDEOS_DIR / video_filename

        if temp_file_path and os.path.exists(temp_file_path):
            try:
                import shutil

                shutil.copy2(temp_file_path, persistent_video_path)
            except Exception as e:
                print(f"Failed to save video for playback: {e}")

        # Return structured response for frontend
        result = {
            "emotion_timeline": [
                {
                    "start": seg.start,
                    "end": seg.end,
                    "emotion": seg.emotion,
                    "intensity": seg.intensity,
                }
                for seg in sentiment_result.emotion_timeline
            ],
            "emotion_seismograph": (
                sentiment_result.emotion_seismograph.model_dump()
                if sentiment_result.emotion_seismograph
                else seismograph
            ),
            "character_emotions": [
                char.model_dump()
                | {
                    "dominantEmotion": char.dominant_emotion,
                    "screenTime": char.screen_time,
                    "id": char.id,
                    "name": char.name,
                    "dominant_emotion": char.dominant_emotion,
                    "screen_time": char.screen_time,
                }
                for char in sentiment_result.character_emotions
            ],
            "global_category": sentiment_result.global_category,
            "confidence": sentiment_result.confidence_score,
            "transcript_segments": transcript_segments,
            "duration": video_duration,
            "video_url": f"/videos/{video_filename}",
        }

        # Cache result
        cache.set(f"sentiment:{request.post_url}", result)

        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to analyze sentiment: {str(e)}"
        )
    finally:
        if myfile:
            try:
                client.files.delete(name=myfile.name)
            except:
                pass
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except:
                pass
