from pydantic import BaseModel, Field
from typing import Optional, List
from routes.fact_check import FactCheckReport

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
    characters: List[Character] = Field(
        default_factory=list,
        description="List of characters/people appearing in the video with their attributes.",
    )
    commentary_summary: str = Field(
        description="A thorough 4-6 sentence explanation of the video's plot, narrative arc, and storyline. Describe what happens from beginning to end, including the setup, key events, any twist or punchline, and the conclusion. Include dialogue context, on-screen text, and how the story unfolds."
    )
    possible_issues: List[str] = Field(
        default_factory=list,
        description="List of potential content violations or sensitive topics detected (e.g., racism, homophobia, misogyny, casteism, islamophobia, hinduphobia, violence, hate speech). Do NOT include misinformation - that is handled by the fact-checker. Empty if none detected.",
    )
    transcript: Optional[str] = Field(
        default=None,
        description="Transcript of audio/speech in the video, if available. Include speaker labels if multiple speakers.",
    )
    suggestions: List[str] = Field(
        default_factory=list,
        description="Suggestions or observations about the content (e.g., context needed, fact-check recommendations, content warnings).",
    )

class EnhancedReelAnalysis(BaseModel):
    """Extended reel analysis with fact-checking using Google Search."""
    main_summary: str = Field(
        description="A concise summary of the video's main topic or message in 2-3 sentences."
    )
    characters: List[Character] = Field(
        default_factory=list,
        description="List of characters/people appearing in the video with their attributes.",
    )
    commentary_summary: str = Field(
        description="A thorough 4-6 sentence explanation of the video's plot, narrative arc, and storyline. Describe what happens from beginning to end, including the setup, key events, any twist or punchline, and the conclusion. Include dialogue context, on-screen text, and how the story unfolds."
    )
    possible_issues: List[str] = Field(
        default_factory=list,
        description="List of potential content violations or sensitive topics detected (e.g., racism, homophobia, misogyny, casteism, islamophobia, hinduphobia, violence, hate speech). Do NOT include misinformation - that is handled by the fact-checker. Empty if none detected.",
    )
    transcript: Optional[str] = Field(
        default=None,
        description="Transcript of audio/speech in the video, if available. Include speaker labels if multiple speakers.",
    )
    suggestions: List[str] = Field(
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
    analysis_timestamp: Optional[float] = Field(
        default=None,
        description="Timestamp of the analysis for cache verification.",
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
    possible_issues: List[str] = Field(
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
    characters: List[CharacterAttributes] = Field(
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
    Anger: List[float] = Field(
        default_factory=list, description="Anger intensity array"
    )
    Disgust: List[float] = Field(
        default_factory=list, description="Disgust intensity array"
    )
    Horror: List[float] = Field(
        default_factory=list, description="Horror intensity array"
    )
    Humor: List[float] = Field(
        default_factory=list, description="Humor intensity array"
    )
    Sadness: List[float] = Field(
        default_factory=list, description="Sadness intensity array"
    )
    Surprise: List[float] = Field(
        default_factory=list, description="Surprise intensity array"
    )

class SentimentAnalysis(BaseModel):
    """Emotion and sentiment analysis from video."""
    emotion_timeline: List[EmotionSegment] = Field(
        description="List of emotion segments with time and intensity",
    )
    emotion_seismograph: EmotionSeismograph = Field(
        default_factory=EmotionSeismograph,
        description="Per-emotion intensity arrays for visualization",
    )
    character_emotions: List[CharacterEmotion] = Field(
        description="Per-character emotion data (id, name, dominant_emotion, volatility, screen_time)",
    )
    global_category: str = Field(
        description="Overall sentiment category, e.g., Positive/Alert, Negative/Concerning",
    )
    confidence_score: float = Field(
        description="Analysis confidence 0.0-1.0", ge=0.0, le=1.0
    )

class TemporalEmotionAnalysis(BaseModel):
    """Emotion timeline and seismograph from specialized temporal analysis."""
    emotion_timeline: List[EmotionSegment] = Field(
        description="List of 1-second emotion segments with {emotion, start, end, intensity}"
    )
    emotion_seismograph: EmotionSeismograph = Field(
        description="6 arrays with intensity values. Array index = time in seconds. Array length = video duration."
    )

class CharacterGlobalAnalysis(BaseModel):
    """Character emotions and overall sentiment from specialized global analysis."""
    character_emotions: List[CharacterEmotion] = Field(
        description="Per-character emotion data with {id, name, dominant_emotion, volatility, screen_time}"
    )
    global_category: str = Field(
        description="Overall sentiment: Positive/Alert, Negative/Concerning, or Neutral/Mixed"
    )
    confidence_score: float = Field(
        ge=0.0,
        le=1.0,
        description="Analysis confidence score 0.0-1.0"
    )

class ReelAnalysisRequest(BaseModel):
    """Request body for reel analysis."""
    post_url: str = Field(description="The Instagram reel/post URL to analyze.")

class YouTubeAnalysisRequest(BaseModel):
    """Request body for YouTube video analysis."""
    video_url: str = Field(description="The YouTube video or Shorts URL to analyze.")
