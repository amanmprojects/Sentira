from fastapi import APIRouter, File, UploadFile, HTTPException, Query
import time
import os
import httpx
import uuid
import cv2
import asyncio
import sys
import hashlib
import shutil
from pathlib import Path
from google import genai

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))

from config import client, DOWNLOADER_BASE_URL, model, bias_model, VIDEOS_DIR
from routes.fact_check import FactCheckReport
from services.fact_checker import FactChecker
from services.youtube_downloader import get_youtube_downloader
from cache import get_cache

# Import new components
from models.video import (
    VideoAnalysis,
    Character,
    ReelAnalysis,
    EnhancedReelAnalysis,
    TranscriptAnalysis,
    CharacterAnalysis,
    SentimentAnalysis,
    TemporalEmotionAnalysis,
    CharacterGlobalAnalysis,
    ReelAnalysisRequest,
    YouTubeAnalysisRequest,
    BiasAnalysis,
    BiasMetric,
)
from prompts.video import (
    TRANSCRIPT_ANALYSIS_PROMPT,
    CHARACTER_ANALYSIS_PROMPT,
    SENTIMENT_ANALYSIS_PROMPT,
    REEL_ANALYSIS_PROMPT,
    YOUTUBE_ANALYSIS_PROMPT,
    TEMPORAL_SYSTEM_INSTRUCTION,
    CHARACTER_GLOBAL_SYSTEM_INSTRUCTION,
    BIAS_ANALYSIS_PROMPT,
    build_temporal_analysis_prompt,
    build_character_global_analysis_prompt,
)
from services.video_service import (
    _generate_seismograph_arrays,
    _extract_character_frames,
)

router = APIRouter(prefix="/analyze-video", tags=["video"])

# In-memory store for Gemini File objects to prevent double-uploading
# Maps URL to (myfile, status, expiry)
UPLOAD_CACHE = {}
UPLOAD_LOCKS = {}  # Maps URL to asyncio.Lock


@router.post("", response_model=VideoAnalysis)
async def analyze_video(video: UploadFile = File(...)):
    """
    Analyze a short-form video and return a summary.
    """
    if not video.filename.lower().endswith((".mp4", ".mov", ".webm", ".avi")):
        raise HTTPException(status_code=400, detail="Invalid video file format")

    temp_file_path = f"temp_{uuid.uuid4().hex}_{video.filename}"
    myfile = None

    try:
        with open(temp_file_path, "wb") as f:
            f.write(await video.read())

        start_time = time.time()
        upload_start = time.time()
        myfile = client.files.upload(file=temp_file_path)
        print(f"DEBUG: [TIME] Upload took {time.time() - upload_start:.2f}s")

        processing_start = time.time()
        while myfile.state == "PROCESSING":
            await asyncio.sleep(2)
            myfile = client.files.get(name=myfile.name)
        print(f"DEBUG: [TIME] Processing took {time.time() - processing_start:.2f}s")

        if myfile.state != "ACTIVE":
            raise HTTPException(
                status_code=500, detail=f"File processing failed: {myfile.state}"
            )

        generation_start = time.time()
        response = client.models.generate_content(
            model=model,
            contents=[myfile, "Analyze this video and provide a summary."],
            config={
                "response_mime_type": "application/json",
                "response_schema": VideoAnalysis,
            },
        )
        print(
            f"DEBUG: [TIME] Gemini generation took {time.time() - generation_start:.2f}s"
        )
        print(f"DEBUG: [TIME] Total analyze_video took {time.time() - start_time:.2f}s")

        return VideoAnalysis.model_validate_json(response.text)

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to analyze video: {str(e)}"
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


@router.post("/reel", response_model=EnhancedReelAnalysis)
async def analyze_reel(request: ReelAnalysisRequest, enable_fact_check: bool = False):
    """Analyze an Instagram reel by URL with PARALLEL LLM calls."""

    myfile = None
    temp_file_path = None

    try:
        start_time = time.time()
        print(
            f"DEBUG: [TIME] Starting Reel Analysis for URL: {request.post_url} at {time.strftime('%H:%M:%S')}"
        )
        # Check Cache (DISABLED)
        # cache = get_cache()
        # cache_key = f"reel:{request.post_url}"
        # cached_result = cache.get(cache_key)
        # if cached_result:
        #     try:
        #         # Validate that the cached data matches the expected model
        #         return EnhancedReelAnalysis(**cached_result)
        #     except Exception as e:
        #         print(f"CACHE TYPE MISMATCH for {cache_key}: {e}")
        #         print(f"DEBUG: Invalidating cache keys for {request.post_url}")
        #         # If cache is corrupted/wrong type, invalidate it and continue
        #         cache.invalidate(request.post_url)
        #         # Also invalidate the prefixed keys to be safe
        #         cache.invalidate(f"reel:{request.post_url}")
        #         cache.invalidate(f"sentiment:{request.post_url}")

        async with httpx.AsyncClient(timeout=60.0) as http_client:
            downloader_url = f"{DOWNLOADER_BASE_URL}/api/video"
            params = {
                "postUrl": request.post_url,
                "enhanced": "true",
                "_t": str(time.time()),
            }
            downloader_start = time.time()
            downloader_response = await http_client.get(downloader_url, params=params)
            print(
                f"DEBUG: [TIME] Downloader metadata request took {time.time() - downloader_start:.2f}s"
            )

            if downloader_response.status_code != 200:
                raise HTTPException(
                    status_code=downloader_response.status_code,
                    detail=f"Downloader failed: {downloader_response.text}",
                )

            video_data = downloader_response.json()
            medias = video_data.get("data", {}).get("medias", [])
            if not medias:
                raise HTTPException(status_code=400, detail="No video media found")

            video_url = medias[0].get("url")
            video_fetch_start = time.time()
            video_response = await http_client.get(video_url)
            print(
                f"DEBUG: [TIME] Video binary download took {time.time() - video_fetch_start:.2f}s"
            )
            if video_response.status_code != 200:
                raise HTTPException(status_code=500, detail="Failed to download video")

            temp_file_path = f"temp_reel_{uuid.uuid4().hex}.mp4"
            with open(temp_file_path, "wb") as f:
                f.write(video_response.content)

        # REDUCED DOUBLE WORK: Check if file already uploaded
        cache_key = request.post_url
        if cache_key not in UPLOAD_LOCKS:
            UPLOAD_LOCKS[cache_key] = asyncio.Lock()

        # DISABLE CACHING - causing 403 errors with expired Gemini files
        # For better caching, implement at the data level, not at the file level
        print(
            f"DEBUG: [SPEED] Uploading new Gemini File (caching disabled to prevent 403 errors)"
        )
        upload_start = time.time()
        myfile = client.files.upload(file=temp_file_path)
        print(
            f"DEBUG: [TIME] Gemini file upload took {time.time() - upload_start:.2f}s"
        )

        processing_start = time.time()
        while myfile.state == "PROCESSING":
            await asyncio.sleep(1)
            myfile = client.files.get(name=myfile.name)
        print(
            f"DEBUG: [TIME] Gemini file processing wait took {time.time() - processing_start:.2f}s"
        )

        if myfile.state != "ACTIVE":
            raise HTTPException(
                status_code=500, detail=f"Gemini processing failed: {myfile.state}"
            )

        step_start_time = time.time()
        print(f"DEBUG: Starting Analysis for {request.post_url}")

        async def analyze_transcript_faster() -> TranscriptAnalysis:
            sub_step_start = time.time()
            response = await client.aio.models.generate_content(
                model=model,
                contents=[myfile, TRANSCRIPT_ANALYSIS_PROMPT],
                config={
                    "response_mime_type": "application/json",
                    "response_schema": TranscriptAnalysis,
                },
            )
            print(
                f"DEBUG: [TIME] analyze_transcript_faster took {time.time() - sub_step_start:.2f}s"
            )
            return TranscriptAnalysis.model_validate_json(response.text)

        async def analyze_characters_faster() -> CharacterAnalysis:
            sub_step_start = time.time()
            response = await client.aio.models.generate_content(
                model=model,
                contents=[myfile, CHARACTER_ANALYSIS_PROMPT],
                config={
                    "response_mime_type": "application/json",
                    "response_schema": CharacterAnalysis,
                },
            )
            print(
                f"DEBUG: [TIME] analyze_characters_faster took {time.time() - sub_step_start:.2f}s"
            )
            return CharacterAnalysis.model_validate_json(response.text)

        async def analyze_bias_faster() -> BiasAnalysis:
            sub_step_start = time.time()
            print(
                f"DEBUG: [BIAS ANALYSIS] Starting bias analysis for {request.post_url}"
            )
            print(f"DEBUG: [BIAS ANALYSIS] Using model: {bias_model}")

            response = await client.aio.models.generate_content(
                model=bias_model,
                contents=[myfile, BIAS_ANALYSIS_PROMPT],
                config={
                    "response_mime_type": "application/json",
                    "response_schema": BiasAnalysis,
                },
            )
            print(
                f"DEBUG: [TIME] analyze_bias_faster took {time.time() - sub_step_start:.2f}s"
            )

            # Log raw response (first 500 chars)
            print(f"DEBUG: [BIAS ANALYSIS] Raw response text: {response.text[:500]}...")

            # Validate and log results
            result = BiasAnalysis.model_validate_json(response.text)

            print(f"DEBUG: [BIAS ANALYSIS] Validated Bias Analysis:")
            print(f"  - overall_score: {result.overall_score}")
            print(f"  - risk_level: {result.risk_level}")
            print(f"  - categories count: {len(result.categories)}")
            for cat in result.categories:
                print(f"    - {cat.label}: score={cat.score}, detected={cat.detected}")
            print(f"  - policy_conflicts count: {len(result.policy_conflicts)}")
            print(f"  - evidence_matrix count: {len(result.evidence_matrix)}")
            print(f"  - risk_vectors: {result.risk_vectors}")
            print(f"  - geographic_relevance: {result.geographic_relevance}")

            # Warning if all scores are zero
            if result.overall_score == 0 and all(
                cat.score == 0 for cat in result.categories
            ):
                print(
                    f"WARNING: [BIAS ANALYSIS] All bias scores are zero! Data may be incomplete."
                )

            return result

        print(
            f"DEBUG: [TIME] Gemini wait/upload for {request.post_url} took {time.time() - start_time:.2f}s"
        )

        analysis_start = time.time()
        transcript_result, character_result, bias_result = await asyncio.gather(
            analyze_transcript_faster(),
            analyze_characters_faster(),
            analyze_bias_faster(),
        )
        print(
            f"DEBUG: [TIME] Parallel analysis calls took {time.time() - analysis_start:.2f}s (TRUE ASYNC)"
        )
        print(f"DEBUG: Analysis results for {request.post_url} received.")

        # Check bias result quality and implement fallback
        print(f"DEBUG: [BIAS CHECK] Checking bias_result quality...")
        if (
            bias_result.overall_score == 0
            and len(bias_result.categories) > 0
            and all(cat.score == 0 for cat in bias_result.categories)
        ):
            print(
                f"WARNING: [BIAS CHECK] Video-based bias analysis returned empty data (all zeros)"
            )
            print(f"DEBUG: [BIAS CHECK] Attempting fallback using transcript...")

            try:
                # Create fallback analysis using transcript
                fallback_prompt = f"""
Analyze this content for **Linguistic Bias, Narrative Framing, and Geopolitical Context**.

You are a critical media analyst. Avoid being overly cautious; if there are subtle cues in language, visual framing, or emotional tone, identify them.

You MUST follow this schema strictly and provide MEANINGFUL data:

1. **overall_score**: (0-100) A summary risk score. Even for neutral content, if there is a specific "point of view," the score should reflect that (e.g., 5-15).
2. **risk_level**: "Low Risk", "Medium Risk", "High Risk", or "Critical".
3. **categories**: You MUST provide entries for these 4 categories. DO NOT leave any out.
   - "Cultural Bias": Does the content assume a specific cultural background? Does it use regional slang or references that exclude others?
   - "Sensitivity Bias": Does it touch on topics that might be sensitive to specific groups (even if handled well)?
   - "Narrative Framing": How is the story presented? Is it one-sided? Does the visual editing push a specific emotion?
   - "Emotional Over-representation": Is the music or acting "over the top" to force a reaction?
   
   For each category, provide a score (0-100), a strength level, and a `detected` boolean.
   *Crucial*: If the score is > 5, set `detected` to true.

4. **policy_conflicts**: Extract 1-2 potential conflicts if possible (e.g., "Perspective Bias", "Dramatic Sensationalism"). If none, provide a generic "Standard Compliance" entry.
5. **evidence_matrix**: Provide 3 specific metrics. Examples: "Slang Density", "Color Grading Mood", "Fast-Cut Pacing", "Camera Angle Dominance". 
   - Each should have a `label` and a `value` (e.g., "High", "Assertive", "Subtle").
6. **risk_vectors**: You MUST distribute 100 points across these three (they MUST sum to exactly 100):
   - negative_skew: (0-100)
   - neutrality: (0-100)
   - positive_lean: (0-100)
   Example for a happy meme: Negative 5, Neutral 20, Positive 75.
7. **geographic_relevance**: List the specific Indian states or regions this content targets or originates from. 
   - Be specific: e.g. ["Maharashtra", "Delhi", "Punjab"].
   - If it's a Western meme (like Breaking Bad), identify if it has "Global" relevance or if it's trending in specific Indian urban hubs like ["Mumbai", "Bangalore"].

**CONTENT TO ANALYZE:**

MAIN SUMMARY:
{transcript_result.main_summary}

COMMENTARY SUMMARY:
{transcript_result.commentary_summary}

TRANSCRIPT:
{transcript_result.transcript or "No transcript available"}

**Output must be pure JSON.**
"""

                fallback_start = time.time()
                print(
                    f"DEBUG: [BIAS FALLBACK] Sending transcript-based analysis to model"
                )

                fallback_response = await client.aio.models.generate_content(
                    model=bias_model,
                    contents=fallback_prompt,
                    config={
                        "response_mime_type": "application/json",
                        "response_schema": BiasAnalysis,
                    },
                )

                print(
                    f"DEBUG: [BIAS FALLBACK] Fallback analysis took {time.time() - fallback_start:.2f}s"
                )

                bias_result = BiasAnalysis.model_validate_json(fallback_response.text)
                print(
                    f"DEBUG: [BIAS FALLBACK] Fallback successful - overall_score: {bias_result.overall_score}"
                )
                print(f"DEBUG: [BIAS FALLBACK] Categories:")
                for cat in bias_result.categories:
                    print(
                        f"  - {cat.label}: score={cat.score}, detected={cat.detected}"
                    )
            except Exception as e:
                print(f"ERROR: [BIAS CHECK] Fallback failed: {e}")
                print(f"DEBUG: [BIAS CHECK] Keeping original (empty) result")
                # Keep original (empty) result

        analysis = EnhancedReelAnalysis(
            main_summary=transcript_result.main_summary,
            commentary_summary=transcript_result.commentary_summary,
            possible_issues=transcript_result.possible_issues,
            bias_analysis=bias_result,
            transcript=transcript_result.transcript,
            characters=[
                Character(**attr.model_dump()) for attr in character_result.characters
            ],
            suggestions=[],
            analysis_timestamp=time.time(),
        )
        print(f"DEBUG: EnhancedReelAnalysis object created successfully.")

        frame_extraction_start = time.time()
        analysis = await _extract_character_frames(analysis, temp_file_path)
        print(
            f"DEBUG: [TIME] Frame extraction took {time.time() - frame_extraction_start:.2f}s"
        )

        if enable_fact_check:
            try:
                fact_check_start = time.time()
                fact_checker = FactChecker(client)
                fact_check_report = fact_checker.fact_check_claims(
                    transcript=analysis.transcript or "",
                    analysis_summary=analysis.commentary_summary or "",
                )
                analysis.fact_check_report = fact_check_report
                analysis.overall_truth_score = fact_check_report.overall_truth_score
                print(
                    f"DEBUG: [TIME] Fact-checking took {time.time() - fact_check_start:.2f}s"
                )
            except Exception as e:
                print(f"Fact-checking failed: {e}")

        misinformation_keywords = [
            "misinformation",
            "false claim",
            "fake news",
            "misleading claim",
        ]
        analysis.possible_issues = [
            issue
            for issue in analysis.possible_issues
            if not any(kw in issue.lower() for kw in misinformation_keywords)
        ]

        # Save to Cache (DISABLED)
        # cache.set(cache_key, analysis.model_dump())
        print(f"DEBUG: [TIME] TOTAL Reel Analysis took {time.time() - start_time:.2f}s")
        print(f"DEBUG: Successfully returning analysis for {request.post_url}")
        return analysis

    except Exception as e:
        print(f"ERROR in analyze_reel: {str(e)}")
        # Provide more helpful error message for cache-related issues
        error_msg = str(e)
        if "403" in error_msg or "PERMISSION_DENIED" in error_msg:
            print(
                "ERROR: Detected cache-related 403 error - check Gemini file caching logic"
            )
        raise HTTPException(status_code=500, detail=f"Failed to analyze reel: {str(e)}")
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


@router.post("/reel/upload", response_model=EnhancedReelAnalysis)
async def analyze_uploaded_reel(
    video: UploadFile = File(...), enable_fact_check: bool = True
):
    """Analyze an uploaded video file with full bias analysis (like /reel endpoint)."""
    if not video.filename.lower().endswith((".mp4", ".mov", ".webm", ".avi")):
        raise HTTPException(status_code=400, detail="Invalid video file format")

    temp_file_path = f"temp_reel_upload_{uuid.uuid4().hex}_{video.filename}"
    myfile = None

    try:
        print(f"DEBUG: [UPLOAD] Reading uploaded file: {video.filename}")
        with open(temp_file_path, "wb") as f:
            f.write(await video.read())
        print(f"DEBUG: [UPLOAD] File saved to: {temp_file_path}")

        start_time = time.time()
        upload_start = time.time()
        myfile = client.files.upload(file=temp_file_path)
        print(f"DEBUG: [TIME] Upload took {time.time() - upload_start:.2f}s")

        processing_start = time.time()
        while myfile.state == "PROCESSING":
            await asyncio.sleep(1)
            myfile = client.files.get(name=myfile.name)
        print(
            f"DEBUG: [TIME] Gemini file processing wait took {time.time() - processing_start:.2f}s"
        )

        if myfile.state != "ACTIVE":
            raise HTTPException(
                status_code=500, detail=f"Gemini processing failed: {myfile.state}"
            )

        print(f"DEBUG: Starting Analysis for uploaded file: {video.filename}")
        print(f"DEBUG: [BIAS ANALYSIS] Using model: {bias_model}")

        async def analyze_transcript_faster() -> TranscriptAnalysis:
            sub_step_start = time.time()
            print(f"DEBUG: [TRANSCRIPT] Starting transcript analysis")
            response = await client.aio.models.generate_content(
                model=model,
                contents=[myfile, TRANSCRIPT_ANALYSIS_PROMPT],
                config={
                    "response_mime_type": "application/json",
                    "response_schema": TranscriptAnalysis,
                },
            )
            print(
                f"DEBUG: [TIME] analyze_transcript_faster took {time.time() - sub_step_start:.2f}s"
            )
            return TranscriptAnalysis.model_validate_json(response.text)

        async def analyze_characters_faster() -> CharacterAnalysis:
            sub_step_start = time.time()
            print(f"DEBUG: [CHARACTERS] Starting character analysis")
            response = await client.aio.models.generate_content(
                model=model,
                contents=[myfile, CHARACTER_ANALYSIS_PROMPT],
                config={
                    "response_mime_type": "application/json",
                    "response_schema": CharacterAnalysis,
                },
            )
            print(
                f"DEBUG: [TIME] analyze_characters_faster took {time.time() - sub_step_start:.2f}s"
            )
            return CharacterAnalysis.model_validate_json(response.text)

        async def analyze_bias_faster() -> BiasAnalysis:
            sub_step_start = time.time()
            print(f"DEBUG: [BIAS ANALYSIS] Starting bias analysis")
            response = await client.aio.models.generate_content(
                model=bias_model,
                contents=[myfile, BIAS_ANALYSIS_PROMPT],
                config={
                    "response_mime_type": "application/json",
                    "response_schema": BiasAnalysis,
                },
            )
            print(
                f"DEBUG: [TIME] analyze_bias_faster took {time.time() - sub_step_start:.2f}s"
            )
            result = BiasAnalysis.model_validate_json(response.text)
            print(
                f"DEBUG: [BIAS ANALYSIS] Validated - overall_score: {result.overall_score}"
            )
            return result

        analysis_start = time.time()
        transcript_result, character_result, bias_result = await asyncio.gather(
            analyze_transcript_faster(),
            analyze_characters_faster(),
            analyze_bias_faster(),
        )
        print(
            f"DEBUG: [TIME] Parallel analysis calls took {time.time() - analysis_start:.2f}s (TRUE ASYNC)"
        )
        print(f"DEBUG: Analysis results received for uploaded file.")

        analysis = EnhancedReelAnalysis(
            main_summary=transcript_result.main_summary,
            commentary_summary=transcript_result.commentary_summary,
            possible_issues=transcript_result.possible_issues,
            bias_analysis=bias_result,
            transcript=transcript_result.transcript,
            characters=[
                Character(**attr.model_dump()) for attr in character_result.characters
            ],
            suggestions=[],
            analysis_timestamp=time.time(),
        )
        print(f"DEBUG: EnhancedReelAnalysis object created successfully.")

        frame_extraction_start = time.time()
        analysis = await _extract_character_frames(analysis, temp_file_path)
        print(
            f"DEBUG: [TIME] Frame extraction took {time.time() - frame_extraction_start:.2f}s"
        )

        if enable_fact_check:
            try:
                fact_check_start = time.time()
                fact_checker = FactChecker(client)
                fact_check_report = fact_checker.fact_check_claims(
                    transcript=analysis.transcript or "",
                    analysis_summary=analysis.commentary_summary or "",
                )
                analysis.fact_check_report = fact_check_report
                analysis.overall_truth_score = fact_check_report.overall_truth_score
                print(
                    f"DEBUG: [TIME] Fact-checking took {time.time() - fact_check_start:.2f}s"
                )
            except Exception as e:
                print(f"Fact-checking failed: {e}")

        misinformation_keywords = [
            "misinformation",
            "false claim",
            "fake news",
            "misleading claim",
        ]
        analysis.possible_issues = [
            issue
            for issue in analysis.possible_issues
            if not any(kw in issue.lower() for kw in misinformation_keywords)
        ]

        print(
            f"DEBUG: [TIME] TOTAL Upload Analysis took {time.time() - start_time:.2f}s"
        )
        return analysis

    except Exception as e:
        print(f"ERROR in analyze_uploaded_reel: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Failed to analyze uploaded reel: {str(e)}"
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

    try:
        start_time = time.time()
        downloader = get_youtube_downloader()
        download_start = time.time()
        video_bytes, filename, metadata = downloader.download_video_bytes(
            request.video_url, max_quality="720p"
        )
        print(
            f"DEBUG: [TIME] YouTube download took {time.time() - download_start:.2f}s"
        )

        temp_file_path = f"temp_youtube_{uuid.uuid4().hex}.mp4"
        with open(temp_file_path, "wb") as f:
            f.write(video_bytes)

        upload_start = time.time()
        myfile = client.files.upload(file=temp_file_path)
        processing_start = time.time()
        while myfile.state == "PROCESSING":
            await asyncio.sleep(1)
            myfile = client.files.get(name=myfile.name)
        print(
            f"DEBUG: [TIME] Gemini upload/processing took {time.time() - upload_start:.2f}s"
        )

        if myfile.state != "ACTIVE":
            raise HTTPException(
                status_code=500, detail=f"Gemini processing failed: {myfile.state}"
            )

        generation_start = time.time()
        print(f"DEBUG: Starting Analysis for YouTube video: {request.video_url}")

        async def analyze_youtube_transcript() -> TranscriptAnalysis:
            sub_step_start = time.time()
            response = await client.aio.models.generate_content(
                model=model,
                contents=[myfile, TRANSCRIPT_ANALYSIS_PROMPT],
                config={
                    "response_mime_type": "application/json",
                    "response_schema": TranscriptAnalysis,
                },
            )
            print(
                f"DEBUG: [TIME] YouTube_analyze_transcript_faster took {time.time() - sub_step_start:.2f}s"
            )
            return TranscriptAnalysis.model_validate_json(response.text)

        async def analyze_youtube_characters() -> CharacterAnalysis:
            sub_step_start = time.time()
            response = await client.aio.models.generate_content(
                model=model,
                contents=[myfile, CHARACTER_ANALYSIS_PROMPT],
                config={
                    "response_mime_type": "application/json",
                    "response_schema": CharacterAnalysis,
                },
            )
            print(
                f"DEBUG: [TIME] YouTube_analyze_characters_faster took {time.time() - sub_step_start:.2f}s"
            )
            return CharacterAnalysis.model_validate_json(response.text)

        async def analyze_youtube_bias() -> BiasAnalysis:
            sub_step_start = time.time()
            print(f"DEBUG: [BIAS ANALYSIS] YouTube - Starting bias analysis")
            print(f"DEBUG: [BIAS ANALYSIS] YouTube - Using model: {bias_model}")

            response = await client.aio.models.generate_content(
                model=bias_model,
                contents=[myfile, BIAS_ANALYSIS_PROMPT],
                config={
                    "response_mime_type": "application/json",
                    "response_schema": BiasAnalysis,
                },
            )
            print(
                f"DEBUG: [TIME] YouTube_analyze_bias_faster took {time.time() - sub_step_start:.2f}s"
            )

            # Log raw response
            print(
                f"DEBUG: [BIAS ANALYSIS] YouTube - Raw response: {response.text[:500]}..."
            )

            result = BiasAnalysis.model_validate_json(response.text)
            print(
                f"DEBUG: [BIAS ANALYSIS] YouTube - overall_score: {result.overall_score}"
            )
            return result

        analysis_start = time.time()
        youtube_transcript, youtube_characters, youtube_bias = await asyncio.gather(
            analyze_youtube_transcript(),
            analyze_youtube_characters(),
            analyze_youtube_bias(),
        )
        print(
            f"DEBUG: [TIME] YouTube Parallel analysis took {time.time() - analysis_start:.2f}s"
        )

        # Check bias result and implement fallback
        print(f"DEBUG: [BIAS CHECK] YouTube - Checking bias_result quality...")
        if (
            youtube_bias.overall_score == 0
            and len(youtube_bias.categories) > 0
            and all(cat.score == 0 for cat in youtube_bias.categories)
        ):
            print(
                f"WARNING: [BIAS CHECK] YouTube - Video-based bias analysis returned empty data"
            )
            print(
                f"DEBUG: [BIAS CHECK] YouTube - Attempting fallback using transcript..."
            )

            try:
                fallback_prompt = f"""
Analyze this content for **Linguistic Bias, Narrative Framing, and Geopolitical Context**.

You are a critical media analyst. Avoid being overly cautious; if there are subtle cues in language, visual framing, or emotional tone, identify them.

You MUST follow this schema strictly and provide MEANINGFUL data:

1. **overall_score**: (0-100) A summary risk score. Even for neutral content, if there is a specific "point of view," the score should reflect that (e.g., 5-15).
2. **risk_level**: "Low Risk", "Medium Risk", "High Risk", or "Critical".
3. **categories**: You MUST provide entries for these 4 categories. DO NOT leave any out.
   - "Cultural Bias": Does the content assume a specific cultural background? Does it use regional slang or references that exclude others?
   - "Sensitivity Bias": Does it touch on topics that might be sensitive to specific groups (even if handled well)?
   - "Narrative Framing": How is the story presented? Is it one-sided? Does the visual editing push a specific emotion?
   - "Emotional Over-representation": Is the music or acting "over the top" to force a reaction?
   
   For each category, provide a score (0-100), a strength level, and a `detected` boolean.
   *Crucial*: If the score is > 5, set `detected` to true.

4. **policy_conflicts**: Extract 1-2 potential conflicts if possible (e.g., "Perspective Bias", "Dramatic Sensationalism"). If none, provide a generic "Standard Compliance" entry.
5. **evidence_matrix**: Provide 3 specific metrics. Examples: "Slang Density", "Color Grading Mood", "Fast-Cut Pacing", "Camera Angle Dominance". 
   - Each should have a `label` and a `value` (e.g., "High", "Assertive", "Subtle").
6. **risk_vectors**: You MUST distribute 100 points across these three (they MUST sum to exactly 100):
   - negative_skew: (0-100)
   - neutrality: (0-100)
   - positive_lean: (0-100)
   Example for a happy meme: Negative 5, Neutral 20, Positive 75.
7. **geographic_relevance**: List the specific Indian states or regions this content targets or originates from. 
   - Be specific: e.g. ["Maharashtra", "Delhi", "Punjab"].
   - If it's a Western meme (like Breaking Bad), identify if it has "Global" relevance or if it's trending in specific Indian urban hubs like ["Mumbai", "Bangalore"].

**CONTENT TO ANALYZE:**

MAIN SUMMARY:
{youtube_transcript.main_summary}

COMMENTARY SUMMARY:
{youtube_transcript.commentary_summary}

TRANSCRIPT:
{youtube_transcript.transcript or "No transcript available"}

**Output must be pure JSON.**
"""

                fallback_start = time.time()
                print(
                    f"DEBUG: [BIAS FALLBACK] YouTube - Sending transcript-based analysis"
                )

                fallback_response = await client.aio.models.generate_content(
                    model=bias_model,
                    contents=fallback_prompt,
                    config={
                        "response_mime_type": "application/json",
                        "response_schema": BiasAnalysis,
                    },
                )

                youtube_bias = BiasAnalysis.model_validate_json(fallback_response.text)
                print(
                    f"DEBUG: [BIAS FALLBACK] YouTube - Fallback successful - overall_score: {youtube_bias.overall_score}"
                )
            except Exception as e:
                print(f"ERROR: [BIAS CHECK] YouTube - Fallback failed: {e}")
                # Keep original (empty) result

        enhanced_analysis = EnhancedReelAnalysis(
            main_summary=youtube_transcript.main_summary,
            commentary_summary=youtube_transcript.commentary_summary,
            possible_issues=youtube_transcript.possible_issues,
            bias_analysis=youtube_bias,
            transcript=youtube_transcript.transcript,
            characters=[
                Character(**attr.model_dump()) for attr in youtube_characters.characters
            ],
            suggestions=[],
            analysis_timestamp=time.time(),
        )
        print(
            f"DEBUG: EnhancedReelAnalysis object created successfully for YouTube video."
        )

        extraction_start = time.time()
        enhanced_analysis = await _extract_character_frames(
            enhanced_analysis, temp_file_path
        )
        print(
            f"DEBUG: [TIME] Character extraction took {time.time() - extraction_start:.2f}s"
        )

        if enable_fact_check:
            try:
                fact_check_start = time.time()
                fact_checker = FactChecker(client)
                fact_check_report = fact_checker.fact_check_claims(
                    transcript=enhanced_analysis.transcript or "",
                    analysis_summary=enhanced_analysis.commentary_summary or "",
                )
                enhanced_analysis.fact_check_report = fact_check_report
                enhanced_analysis.overall_truth_score = (
                    fact_check_report.overall_truth_score
                )
                print(
                    f"DEBUG: [TIME] Fact-check took {time.time() - fact_check_start:.2f}s"
                )
            except Exception as e:
                print(f"Fact-checking failed: {e}")

        misinformation_keywords = [
            "misinformation",
            "false claim",
            "fake news",
            "misleading claim",
        ]
        enhanced_analysis.possible_issues = [
            issue
            for issue in enhanced_analysis.possible_issues
            if not any(kw in issue.lower() for kw in misinformation_keywords)
        ]

        print(
            f"DEBUG: [TIME] Total YouTube analysis took {time.time() - start_time:.2f}s"
        )
        return enhanced_analysis

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to analyze YouTube video: {str(e)}"
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


async def _perform_full_sentiment_analysis(
    temp_file_path: str, video_duration: int, raw_key: str
):
    """Internal helper to run parallel Gemini analysis on a video file."""
    cache_key = raw_key
    myfile = None
    start_time = time.time()
    try:
        # Check cache logic
        if cache_key not in UPLOAD_LOCKS:
            UPLOAD_LOCKS[cache_key] = asyncio.Lock()

        # DISABLE CACHING - causing 403 errors with expired Gemini files
        print(
            f"DEBUG: [SPEED] Uploading new Gemini File for sentiment (caching disabled to prevent 403 errors)"
        )
        upload_op_start = time.time()
        myfile = client.files.upload(file=temp_file_path)
        print(
            f"DEBUG: [TIME] Sentiment Gemini upload took {time.time() - upload_op_start:.2f}s"
        )

        processing_start = time.time()
        while myfile.state == "PROCESSING":
            await asyncio.sleep(1)
            myfile = client.files.get(name=myfile.name)
        print(
            f"DEBUG: [TIME] Sentiment Gemini processing wait took {time.time() - processing_start:.2f}s"
        )

        if myfile.state != "ACTIVE":
            raise HTTPException(
                status_code=500, detail=f"Gemini processing failed: {myfile.state}"
            )

        async def analyze_temporal_emotions() -> TemporalEmotionAnalysis:
            temporal_prompt = build_temporal_analysis_prompt(video_duration)
            response = await client.aio.models.generate_content(
                model=model,
                contents=[myfile, temporal_prompt],
                config=genai.types.GenerateContentConfig(
                    system_instruction=TEMPORAL_SYSTEM_INSTRUCTION,
                    response_mime_type="application/json",
                    response_schema=TemporalEmotionAnalysis,
                ),
            )
            return TemporalEmotionAnalysis.model_validate_json(response.text)

        async def analyze_character_global() -> CharacterGlobalAnalysis:
            character_prompt = build_character_global_analysis_prompt(video_duration)
            response = await client.aio.models.generate_content(
                model=model,
                contents=[myfile, character_prompt],
                config=genai.types.GenerateContentConfig(
                    system_instruction=CHARACTER_GLOBAL_SYSTEM_INSTRUCTION,
                    response_mime_type="application/json",
                    response_schema=CharacterGlobalAnalysis,
                ),
            )
            return CharacterGlobalAnalysis.model_validate_json(response.text)

        temporal_start = time.time()
        temporal_result, character_result = await asyncio.gather(
            analyze_temporal_emotions(), analyze_character_global()
        )
        print(
            f"DEBUG: [TIME] Parallel sentiment analysis took {time.time() - temporal_start:.2f}s (TRUE ASYNC)"
        )

        sentiment_result = SentimentAnalysis(
            emotion_timeline=temporal_result.emotion_timeline,
            emotion_seismograph=temporal_result.emotion_seismograph,
            character_emotions=character_result.character_emotions,
            global_category=character_result.global_category,
            confidence_score=character_result.confidence_score,
        )

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

        # Use cache_key hash for video filename to keep it consistent for URLs
        url_hash = hashlib.md5(cache_key.encode()).hexdigest()
        video_filename = f"video_{url_hash}.mp4"
        persistent_video_path = VIDEOS_DIR / video_filename

        # Save persistent copy for frontend serving
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                shutil.copy2(temp_file_path, persistent_video_path)
            except Exception as e:
                print(f"Failed to save video: {e}")

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
            "emotion_seismograph": sentiment_result.emotion_seismograph.model_dump(),
            "character_emotions": [
                char.model_dump()
                | {
                    "dominantEmotion": char.dominant_emotion,
                    "screenTime": char.screen_time,
                }
                for char in sentiment_result.character_emotions
            ],
            "global_category": sentiment_result.global_category,
            "confidence": sentiment_result.confidence_score,
            "transcript_segments": transcript_segments,
            "duration": video_duration,
            "video_url": f"/videos/{video_filename}",
            "analysis_timestamp": time.time(),
        }

        # Save to Cache (DISABLED)
        # get_cache().set(cache_key, result)
        return result

    finally:
        if myfile:
            try:
                client.files.delete(name=myfile.name)
            except:
                pass


@router.post("/sentiment")
async def analyze_sentiment_url(request: ReelAnalysisRequest):
    """Dedicated sentiment/emotion analysis endpoint for URLs."""
    # Check Cache first (DISABLED)
    # cache = get_cache()
    # cache_key = f"sentiment:{request.post_url}"
    # cached_result = cache.get(cache_key)
    # if cached_result:
    #     try:
    #         # Verify the video file actually exists
    #         video_filename = cached_result.get("video_url", "").split("/")[-1]
    #         if video_filename and (VIDEOS_DIR / video_filename).exists():
    #             # Basic validation (sentiment data should have emotion_timeline)
    #             if "emotion_timeline" in cached_result:
    #                 return cached_result
    #             else:
    #                 print(f"CACHE INVALID for {cache_key}: missing emotion_timeline")
    #     except Exception as e:
    #         print(f"CACHE ERROR for {cache_key}: {e}")
    #
    #     # If we get here, cache was invalid or file missing
    #     cache.invalidate(cache_key)

    temp_file_path = None
    try:
        is_youtube = "youtube.com" in request.post_url or "youtu.be" in request.post_url

        if is_youtube:
            downloader = get_youtube_downloader()
            video_bytes, filename, metadata = downloader.download_video_bytes(
                request.post_url, max_quality="720p"
            )
            video_duration = metadata.get("length", 30)
            temp_file_path = f"temp_youtube_{uuid.uuid4().hex}.mp4"
            with open(temp_file_path, "wb") as f:
                f.write(video_bytes)
        else:
            async with httpx.AsyncClient(timeout=60.0) as http_client:
                downloader_url = f"{DOWNLOADER_BASE_URL}/api/video"
                response = await http_client.get(
                    downloader_url,
                    params={
                        "postUrl": request.post_url,
                        "enhanced": "true",
                        "_t": str(time.time()),
                    },
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

                cap = cv2.VideoCapture(temp_file_path)
                video_duration = (
                    int(cap.get(cv2.CAP_PROP_FRAME_COUNT) / cap.get(cv2.CAP_PROP_FPS))
                    if cap.get(cv2.CAP_PROP_FPS) > 0
                    else 30
                )
                cap.release()

        return await _perform_full_sentiment_analysis(
            temp_file_path, video_duration, request.post_url
        )

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to analyze sentiment: {str(e)}"
        )
    finally:
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except:
                pass


@router.post("/sentiment/upload")
async def analyze_sentiment_upload(video: UploadFile = File(...)):
    """Sentiment/emotion analysis for uploaded video files."""
    if not video.filename.lower().endswith((".mp4", ".mov", ".webm", ".avi")):
        raise HTTPException(status_code=400, detail="Invalid video file format")

    temp_file_path = f"temp_upload_{uuid.uuid4().hex}_{video.filename}"
    try:
        contents = await video.read()
        with open(temp_file_path, "wb") as f:
            f.write(contents)

        # Get video duration
        cap = cv2.VideoCapture(temp_file_path)
        video_duration = (
            int(cap.get(cv2.CAP_PROP_FRAME_COUNT) / cap.get(cv2.CAP_PROP_FPS))
            if cap.get(cv2.CAP_PROP_FPS) > 0
            else 30
        )
        cap.release()

        # Generate a semi-stable cache key for the file based on its name and size
        # (This is better than nothing, but not as good as a content hash)
        cache_key = f"upload_{video.filename}_{len(contents)}"

        return await _perform_full_sentiment_analysis(
            temp_file_path, video_duration, cache_key
        )

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to analyze uploaded video: {str(e)}"
        )
    finally:
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except:
                pass
