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

from config import client, DOWNLOADER_BASE_URL, model, VIDEOS_DIR
from routes.fact_check import FactCheckReport
from services.fact_checker import FactChecker
from services.youtube_downloader import get_youtube_downloader
from cache import get_cache

# Import new components
from models.video import (
    VideoAnalysis, Character, ReelAnalysis, EnhancedReelAnalysis,
    TranscriptAnalysis, CharacterAnalysis, SentimentAnalysis,
    TemporalEmotionAnalysis, CharacterGlobalAnalysis,
    ReelAnalysisRequest, YouTubeAnalysisRequest
)
from prompts.video import (
    TRANSCRIPT_ANALYSIS_PROMPT, CHARACTER_ANALYSIS_PROMPT,
    SENTIMENT_ANALYSIS_PROMPT, REEL_ANALYSIS_PROMPT, YOUTUBE_ANALYSIS_PROMPT,
    TEMPORAL_SYSTEM_INSTRUCTION, CHARACTER_GLOBAL_SYSTEM_INSTRUCTION,
    build_temporal_analysis_prompt, build_character_global_analysis_prompt
)
from services.video_service import _generate_seismograph_arrays, _extract_character_frames

router = APIRouter(prefix="/analyze-video", tags=["video"])

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

        myfile = client.files.upload(file=temp_file_path)

        while myfile.state == "PROCESSING":
            await asyncio.sleep(2)
            myfile = client.files.get(name=myfile.name)

        if myfile.state != "ACTIVE":
            raise HTTPException(status_code=500, detail=f"File processing failed: {myfile.state}")

        response = client.models.generate_content(
            model=model,
            contents=[myfile, "Analyze this video and provide a summary."],
            config={"response_mime_type": "application/json", "response_schema": VideoAnalysis},
        )

        return VideoAnalysis.model_validate_json(response.text)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze video: {str(e)}")
    finally:
        if myfile:
            try: client.files.delete(name=myfile.name)
            except: pass
        if temp_file_path and os.path.exists(temp_file_path):
            try: os.remove(temp_file_path)
            except: pass


@router.post("/reel", response_model=EnhancedReelAnalysis)
async def analyze_reel(request: ReelAnalysisRequest, enable_fact_check: bool = False):
    """Analyze an Instagram reel by URL with PARALLEL LLM calls."""

    myfile = None
    temp_file_path = None

    try:
        # Check Cache
        cache = get_cache()
        cached_result = cache.get(request.post_url)
        if cached_result:
            return EnhancedReelAnalysis(**cached_result)

        async with httpx.AsyncClient(timeout=60.0) as http_client:
            downloader_url = f"{DOWNLOADER_BASE_URL}/api/video"
            params = {"postUrl": request.post_url, "enhanced": "true", "_t": str(time.time())}
            downloader_response = await http_client.get(downloader_url, params=params)

            if downloader_response.status_code != 200:
                raise HTTPException(status_code=downloader_response.status_code, detail=f"Downloader failed: {downloader_response.text}")

            video_data = downloader_response.json()
            medias = video_data.get("data", {}).get("medias", [])
            if not medias: raise HTTPException(status_code=400, detail="No video media found")

            video_url = medias[0].get("url")
            video_response = await http_client.get(video_url)
            if video_response.status_code != 200: raise HTTPException(status_code=500, detail="Failed to download video")

            temp_file_path = f"temp_reel_{uuid.uuid4().hex}.mp4"
            with open(temp_file_path, "wb") as f: f.write(video_response.content)

        myfile = client.files.upload(file=temp_file_path)
        while myfile.state == "PROCESSING":
            await asyncio.sleep(1)
            myfile = client.files.get(name=myfile.name)

        if myfile.state != "ACTIVE":
            raise HTTPException(status_code=500, detail=f"Gemini processing failed: {myfile.state}")

        async def analyze_transcript_faster() -> TranscriptAnalysis:
            response = client.models.generate_content(
                model=model, contents=[myfile, TRANSCRIPT_ANALYSIS_PROMPT],
                config={"response_mime_type": "application/json", "response_schema": TranscriptAnalysis},
            )
            return TranscriptAnalysis.model_validate_json(response.text)

        async def analyze_characters_faster() -> CharacterAnalysis:
            response = client.models.generate_content(
                model=model, contents=[myfile, CHARACTER_ANALYSIS_PROMPT],
                config={"response_mime_type": "application/json", "response_schema": CharacterAnalysis},
            )
            return CharacterAnalysis.model_validate_json(response.text)

        transcript_result, character_result = await asyncio.gather(
            analyze_transcript_faster(), analyze_characters_faster()
        )

        analysis = EnhancedReelAnalysis(
            main_summary=transcript_result.main_summary,
            commentary_summary=transcript_result.commentary_summary,
            possible_issues=transcript_result.possible_issues,
            transcript=transcript_result.transcript,
            characters=[Character(**attr.model_dump()) for attr in character_result.characters],
            suggestions=[],
            analysis_timestamp=time.time(),
        )

        analysis = await _extract_character_frames(analysis, temp_file_path)

        if enable_fact_check:
            try:
                fact_checker = FactChecker(client)
                fact_check_report = fact_checker.fact_check_claims(
                    transcript=analysis.transcript or "",
                    analysis_summary=analysis.commentary_summary or "",
                )
                analysis.fact_check_report = fact_check_report
                analysis.overall_truth_score = fact_check_report.overall_truth_score
            except Exception as e:
                print(f"Fact-checking failed: {e}")

        misinformation_keywords = ["misinformation", "false claim", "fake news", "misleading claim"]
        analysis.possible_issues = [issue for issue in analysis.possible_issues if not any(kw in issue.lower() for kw in misinformation_keywords)]

        # Save to Cache
        cache.set(request.post_url, analysis.model_dump())

        return analysis

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze reel: {str(e)}")
    finally:
        if myfile:
            try: client.files.delete(name=myfile.name)
            except: pass
        if temp_file_path and os.path.exists(temp_file_path):
            try: os.remove(temp_file_path)
            except: pass


@router.post("/youtube", response_model=EnhancedReelAnalysis)
async def analyze_youtube(request: YouTubeAnalysisRequest, enable_fact_check: bool = True):
    """Analyze a YouTube video by URL."""
    myfile = None
    temp_file_path = None

    try:
        downloader = get_youtube_downloader()
        video_bytes, filename, metadata = downloader.download_video_bytes(request.video_url, max_quality="720p")

        temp_file_path = f"temp_youtube_{uuid.uuid4().hex}.mp4"
        with open(temp_file_path, "wb") as f: f.write(video_bytes)

        myfile = client.files.upload(file=temp_file_path)
        while myfile.state == "PROCESSING":
            await asyncio.sleep(1)
            myfile = client.files.get(name=myfile.name)

        if myfile.state != "ACTIVE":
            raise HTTPException(status_code=500, detail=f"Gemini processing failed: {myfile.state}")

        response = client.models.generate_content(
            model=model, contents=[myfile, YOUTUBE_ANALYSIS_PROMPT],
            config={"response_mime_type": "application/json", "response_schema": ReelAnalysis},
        )

        analysis = ReelAnalysis.model_validate_json(response.text)
        enhanced_analysis = EnhancedReelAnalysis(**analysis.model_dump(), analysis_timestamp=time.time())
        enhanced_analysis = await _extract_character_frames(enhanced_analysis, temp_file_path)

        if enable_fact_check:
            try:
                fact_checker = FactChecker(client)
                fact_check_report = fact_checker.fact_check_claims(
                    transcript=enhanced_analysis.transcript or "",
                    analysis_summary=enhanced_analysis.commentary_summary or "",
                )
                enhanced_analysis.fact_check_report = fact_check_report
                enhanced_analysis.overall_truth_score = fact_check_report.overall_truth_score
            except Exception as e:
                print(f"Fact-checking failed: {e}")

        misinformation_keywords = ["misinformation", "false claim", "fake news", "misleading claim"]
        enhanced_analysis.possible_issues = [issue for issue in enhanced_analysis.possible_issues if not any(kw in issue.lower() for kw in misinformation_keywords)]

        return enhanced_analysis

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze YouTube video: {str(e)}")
    finally:
        if myfile:
            try: client.files.delete(name=myfile.name)
            except: pass
        if temp_file_path and os.path.exists(temp_file_path):
            try: os.remove(temp_file_path)
            except: pass


@router.post("/sentiment")
async def analyze_sentiment_url(request: ReelAnalysisRequest):
    """Dedicated sentiment/emotion analysis endpoint."""

    myfile = None
    temp_file_path = None
    video_duration = 30

    try:
        is_youtube = "youtube.com" in request.post_url or "youtu.be" in request.post_url

        if is_youtube:
            downloader = get_youtube_downloader()
            video_bytes, filename, metadata = downloader.download_video_bytes(request.post_url, max_quality="720p")
            video_duration = metadata.get("length", 30)
            temp_file_path = f"temp_youtube_{uuid.uuid4().hex}.mp4"
            with open(temp_file_path, "wb") as f: f.write(video_bytes)
        else:
            async with httpx.AsyncClient(timeout=60.0) as http_client:
                downloader_url = f"{DOWNLOADER_BASE_URL}/api/video"
                response = await http_client.get(downloader_url, params={"postUrl": request.post_url, "enhanced": "true", "_t": str(time.time())})
                video_data = response.json()
                medias = video_data.get("data", {}).get("medias", [])
                if not medias: raise HTTPException(status_code=400, detail="No video media found")

                video_url = medias[0].get("url")
                video_response = await http_client.get(video_url)
                temp_file_path = f"temp_reel_{uuid.uuid4().hex}.mp4"
                with open(temp_file_path, "wb") as f: f.write(video_response.content)

                cap = cv2.VideoCapture(temp_file_path)
                video_duration = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) / cap.get(cv2.CAP_PROP_FPS))
                cap.release()

        myfile = client.files.upload(file=temp_file_path)
        while myfile.state == "PROCESSING":
            await asyncio.sleep(1)
            myfile = client.files.get(name=myfile.name)

        # Check Cache
        cache = get_cache()
        cached_result = cache.get(request.post_url)
        if cached_result:
            return cached_result

        if myfile.state != "ACTIVE":
            raise HTTPException(status_code=500, detail=f"File processing failed: {myfile.state}")

        async def analyze_temporal_emotions() -> TemporalEmotionAnalysis:
            temporal_prompt = build_temporal_analysis_prompt(video_duration)
            response = client.models.generate_content(
                model=model, contents=[myfile, temporal_prompt],
                config=genai.types.GenerateContentConfig(
                    system_instruction=TEMPORAL_SYSTEM_INSTRUCTION,
                    response_mime_type="application/json",
                    response_schema=TemporalEmotionAnalysis,
                ),
            )
            return TemporalEmotionAnalysis.model_validate_json(response.text)

        async def analyze_character_global() -> CharacterGlobalAnalysis:
            character_prompt = build_character_global_analysis_prompt(video_duration)
            response = client.models.generate_content(
                model=model, contents=[myfile, character_prompt],
                config=genai.types.GenerateContentConfig(
                    system_instruction=CHARACTER_GLOBAL_SYSTEM_INSTRUCTION,
                    response_mime_type="application/json",
                    response_schema=CharacterGlobalAnalysis,
                ),
            )
            return CharacterGlobalAnalysis.model_validate_json(response.text)

        temporal_result, character_result = await asyncio.gather(
            analyze_temporal_emotions(), analyze_character_global()
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
                "id": i, "start": seg.start, "end": seg.end,
                "text": f"[{seg.start:.0f}s-{seg.end:.0f}s] {seg.emotion} emotion (intensity: {seg.intensity:.2f})",
                "emotion": seg.emotion,
            }
            for i, seg in enumerate(sentiment_result.emotion_timeline)
        ]

        url_hash = hashlib.md5(request.post_url.encode()).hexdigest()
        video_filename = f"video_{url_hash}.mp4"
        persistent_video_path = VIDEOS_DIR / video_filename
        if temp_file_path and os.path.exists(temp_file_path):
            try: shutil.copy2(temp_file_path, persistent_video_path)
            except Exception as e: print(f"Failed to save video: {e}")

        result = {
            "emotion_timeline": [{"start": seg.start, "end": seg.end, "emotion": seg.emotion, "intensity": seg.intensity} for seg in sentiment_result.emotion_timeline],
            "emotion_seismograph": sentiment_result.emotion_seismograph.model_dump(),
            "character_emotions": [char.model_dump() | {"dominantEmotion": char.dominant_emotion, "screenTime": char.screen_time} for char in sentiment_result.character_emotions],
            "global_category": sentiment_result.global_category,
            "confidence": sentiment_result.confidence_score,
            "transcript_segments": transcript_segments,
            "duration": video_duration,
            "video_url": f"/videos/{video_filename}",
            "analysis_timestamp": time.time(),
        }

        # Save to Cache
        cache.set(request.post_url, result)

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze sentiment: {str(e)}")
    finally:
        if myfile:
            try: client.files.delete(name=myfile.name)
            except: pass
        if temp_file_path and os.path.exists(temp_file_path):
            try: os.remove(temp_file_path)
            except: pass
