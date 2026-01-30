from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from pydantic import BaseModel, Field
from typing import List, Literal, Optional
import os
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


class BiasTechnique(BaseModel):
    """A specific bias or manipulation technique detected."""
    technique_type: Literal[
        "one_sided_argument",
        "emotional_manipulation",
        "selective_facts",
        "inflammatory_language",
        "confirmation_bias",
        "false_dilemma",
        "strawman",
        "ad_hominem",
        "appeal_to_emotion",
        "bandwagon_fallacy"
    ] = Field(description="The specific type of bias or manipulation technique detected.")
    description: str = Field(description="Brief description of how this technique was used in the video.")
    severity: Literal["low", "medium", "high", "critical"] = Field(description="How severely this technique impacts the content's credibility.")


class SentimentDetail(BaseModel):
    """Detailed sentiment analysis."""
    overall: Literal["positive", "negative", "neutral", "mixed"] = Field(
        description="The overall emotional tone and intent of the content."
    )
    primary_emotion: Literal["joy", "sadness", "anger", "fear", "disgust", "surprise", "anticipation", "trust", "neutral"] = Field(
        description="The dominant emotion conveyed."
    )
    secondary_emotions: List[Literal["joy", "sadness", "anger", "fear", "disgust", "surprise", "anticipation", "trust", "neutral"]] = Field(
        description="Other emotions present in the content."
    )
    emotional_intensity: Literal["subtle", "mild", "moderate", "strong", "intense"] = Field(
        description="How strongly the emotions are conveyed."
    )
    intent: Literal["informative", "persuasive", "entertaining", "inciting", "inspiring", "warning", "satirical", "mixed"] = Field(
        description="The content creator's apparent intent."
    )


class ContentCategory(BaseModel):
    """Content category and topic analysis."""
    primary_category: Literal[
        "news_politics", "entertainment", "education", "lifestyle",
        "sports", "technology", "health_wellness", "religion", "social_issues",
        "comedy", "music", "arts_culture", "science", "business", "other"
    ] = Field(description="The main topic category of the video.")
    subcategories: List[str] = Field(description="Specific subtopics covered in the video.")
    target_audience: Literal[
        "teens", "young_adults", "adults", "seniors", "general", "niche_community"
    ] = Field(description="The intended target audience.")
    viral_factors: List[str] = Field(
        description="Factors that may contribute to the content's viral potential"
    )


class BiasAnalysis(BaseModel):
    """Comprehensive bias and credibility analysis."""
    overall_bias_level: Literal["none", "low", "moderate", "high", "severe"] = Field(
        description="The overall level of bias detected in the content."
    )
    techniques: List[BiasTechnique] = Field(description="Specific bias and manipulation techniques detected.")
    credibility_flags: List[Literal[
        "no_sources_cited", "suspicious_claims", "outdated_information",
        "clickbait", "emotional_rather_than_factual", "unverified_information",
        "misleading_statistics", "cherry_picked_data", "false_context"
    ]] = Field(description="Flags indicating potential credibility issues.")
    factuality_note: str = Field(description="Assessment of the content's factual reliability.")
    perspective_restriction: Literal["balanced", "single_perspective", "multiple_perspective"] = Field(
        description="How many perspectives on the issue are presented."
    )


class TrendAnalysis(BaseModel):
    """Trend and social dynamics analysis."""
    current_trends: List[str] = Field(description="Trending topics, hashtags, or themes the video relates to.")
    social_dynamics: List[Literal[
        "societal_pressure", "peer_influence", "fear_of_missing_out",
        "group_identity", "social_validation", "counterculture",
        "mainstream_alignment", "subculture_membership", "identity_affirmation"
    ]] = Field(description="Social dynamics at play in the content.")
    viral_potential: Literal["low", "medium", "high", "very_high"] = Field(
        description="Estimated potential for virality based on content analysis."
    )
    engagement_drivers: List[str] = Field(description="Elements likely to drive engagement.")
    community_signals: List[str] = Field(description="Signals about which communities might engage with this content.")


class ContentQuality(BaseModel):
    """Quality and production analysis."""
    production_quality: Literal["low", "medium", "high", "professional"] = Field(
        description="The perceived production quality of the video."
    )
    narrative_structure: Literal["linear", "non_linear", "fragmented", "none"] = Field(
        description="How the narrative is structured."
    )
    content_depth: Literal["shallow", "moderate", "deep"] = Field(
        description="The depth and complexity of the subject matter."
    )
    clarity_score: Literal["very_clear", "clear", "somewhat_clear", "confusing", "very_confusing"] = Field(
        description="How clearly the message is communicated."
    )


class VideoAnalysis(BaseModel):
    """Comprehensive structured output for video content analysis."""
    summary: str = Field(
        description="Detailed 3-4 sentence summary of the video content, including main message and context."
    )
    key_takeaways: List[str] = Field(description="The main points or messages the viewer is meant to take away.")
    sentiment: SentimentDetail = Field(description="Detailed emotional and intent analysis.")
    categories: ContentCategory = Field(description="Topic categorization and audience analysis.")
    bias: BiasAnalysis = Field(description="Comprehensive bias and credibility analysis.")
    trends: TrendAnalysis = Field(description="Trend and social dynamics analysis.")
    quality: ContentQuality = Field(description="Content quality and structural analysis.")
    flagged_content: bool = Field(description="Whether the content contains potentially harmful or problematic material.")
    content_warnings: List[str] = Field(description="Specific warnings about content type (e.g., medical misinformation, hate speech indicators).")


# Simplified response for API compatibility
class VideoAnalysisResponse(BaseModel):
    sentiment: str
    summary: str
    bias_detected: bool
    key_trends: list[str]
    # Additional detailed fields
    primary_emotion: str = ""
    overall_bias_level: str = ""
    viral_potential: str = ""
    target_audience: str = ""
    credibility_flags: list[str] = []
    bias_techniques: list[dict] = []
    key_takeaways: list[str] = []
    production_quality: str = ""
    content_warnings: list[str] = []
    flagged_content: bool = False
    engagement_drivers: list[str] = []
    social_dynamics: list[str] = []


@app.post("/analyze-video", response_model=VideoAnalysisResponse)
async def analyze_video(video: UploadFile = File(...)):
    """
    Analyze a short-form video for sentiment, bias, and content trends.

    This endpoint processes short-form video content (reels, shorts) to identify:
    - Overall sentiment (positive, negative, neutral, or mixed)
    - Content summary
    - Presence of bias or manipulative content
    - Key trends or themes present in the video
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
        import time
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
        Perform a comprehensive analysis of this short-form social media video.
        Analyze:
        1. Sentiment and emotional intent - including primary/secondary emotions and intensity
        2. Bias and credibility - specific manipulation techniques, credibility flags, and factuality assessment
        3. Trends and social dynamics - viral factors, engagement drivers, and community signals
        4. Content categorization - primary category, subcategories, and target audience
        5. Content quality - production quality, narrative structure, and content depth
        6. Potential harmful content - medical misinformation, hate speech indicators, or other problematic material

        Be thorough and specific in your analysis.
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

        return VideoAnalysisResponse(
            sentiment=analysis.sentiment.overall,
            summary=analysis.summary,
            bias_detected=analysis.bias.overall_bias_level != "none",
            key_trends=analysis.trends.current_trends,
            primary_emotion=analysis.sentiment.primary_emotion,
            overall_bias_level=analysis.bias.overall_bias_level,
            viral_potential=analysis.trends.viral_potential,
            target_audience=analysis.categories.target_audience,
            credibility_flags=analysis.bias.credibility_flags,
            bias_techniques=[{
                "technique": t.technique_type,
                "description": t.description,
                "severity": t.severity
            } for t in analysis.bias.techniques],
            key_takeaways=analysis.key_takeaways,
            production_quality=analysis.quality.production_quality,
            content_warnings=analysis.content_warnings,
            flagged_content=analysis.flagged_content,
            engagement_drivers=analysis.trends.engagement_drivers,
            social_dynamics=analysis.trends.social_dynamics,
        )

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
            "/analyze-video": "POST - Upload a video for sentiment, bias, and trend analysis"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
