import os
import cv2
import base64
import asyncio
from typing import List, Dict
from models.video import EnhancedReelAnalysis, Character

def _generate_seismograph_arrays(
    emotion_timeline: List[Dict], duration: float
) -> Dict[str, List[float]]:
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
    """Extract frame images for characters with timestamps from video (SEQUENTIAL)."""
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

        # SEQUENTIAL EXTRACTION (MUCH FASTER than random seeking)
        import time
        extractions_start = time.time()
        
        # Sort characters by timestamp to minimize seeking overhead
        chars_to_process = [c for c in analysis.characters if c.timestamp is not None]
        chars_to_process.sort(key=lambda x: x.timestamp)

        for char in chars_to_process:
            try:
                frame_num = int(char.timestamp * vid_fps)
                # Moving forward is generally faster than jumping around
                cap.set(cv2.CAP_PROP_POS_FRAMES, frame_num)
                ret, frame = cap.read()
                if not ret:
                    continue

                # Resize to 500px 
                height, width = frame.shape[:2]
                max_dim = 500
                if width > height:
                    new_width = max_dim
                    new_height = int(height * (max_dim / width))
                else:
                    new_height = max_dim
                    new_width = int(width * (height / max_dim))

                # Use AREA for shrinking (faster/better for downsizing)
                frame_resized = cv2.resize(frame, (new_width, new_height), interpolation=cv2.INTER_AREA)

                # 85% quality (good balance)
                _, buffer = cv2.imencode(
                    ".jpg", frame_resized, [cv2.IMWRITE_JPEG_QUALITY, 85]
                )
                char.frame_image_b64 = base64.b64encode(buffer).decode("utf-8")
            except Exception as e:
                print(f"Failed to extract frame for char at {char.timestamp}s: {e}")

        print(f"DEBUG: [TIME] Sequential extraction took {time.time() - extractions_start:.2f}s")
        cap.release()
        return analysis

    except Exception as e:
        print(f"Failed to extract character frames: {e}")
        return analysis
