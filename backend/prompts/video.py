# ==================== Structured Reel Analysis Prompts ====================

TRANSCRIPT_ANALYSIS_PROMPT = """
Analyze this short-form video and provide:

1. transcript: Full transcription of all speech with timestamp markers [MM:SS] where each line shows the time
2. main_summary: 2-3 sentence summary of the video's main topic/message
3. commentary_summary: 8-10 sentence narrative arc describing the full story from beginning to end, including setup, key events, twist/punchline, conclusion, dialogue, and on-screen text
4. possible_issues: List any content violations (racism, homophobia, misogyny, casteism, islamophobia, hinduphobia, violence, hate speech). Leave empty if none.

Focus on text and speech. Do not analyze characters in detail - that's a separate task.
"""

BIAS_ANALYSIS_PROMPT = """
Analyze this video for **Linguistic Bias, Narrative Framing, and Geopolitical Context**.

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

**Output must be pure JSON.**
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

YOUTUBE_ANALYSIS_PROMPT = REEL_ANALYSIS_PROMPT


# ==================== Parallel Sentiment Engine Instructions ====================

TEMPORAL_SYSTEM_INSTRUCTION = """
You are an expert emotion analyst specializing in temporal emotion tracking.

Your task is to analyze video content and identify emotional patterns at 1-second intervals.

Focus on:
- Precise emotional transitions and intensity changes
- Visual and audio emotional cues
- Timeline-based emotion flow
- Accurate seismograph array generation

Emotions to track: Anger, Disgust, Horror, Humor, Sadness, Surprise

CRITICAL for emotion_seismograph:
- Array index MUST equal the time position in seconds
- Array length MUST equal video duration
- Each array position = intensity at that specific second
"""

CHARACTER_GLOBAL_SYSTEM_INSTRUCTION = """
You are an expert in character emotion analysis and overall sentiment assessment.

Your task is to:
1. Identify each unique person/character in the video
2. Determine their dominant emotional state
3. Assess their emotional volatility over time
4. Calculate their proportional screen presence (0.0-100.0%)
5. Determine the overall sentiment category of the entire video (Positive/Alert, Negative/Concerning, or Neutral/Mixed)
6. Provide a confidence score for your analysis

Be consistent with your character tracking and objective in your assessments.
"""


def build_temporal_analysis_prompt(video_duration_seconds: int) -> str:
    """Build dynamic prompt for temporal emotion analysis."""
    minutes = video_duration_seconds // 60
    seconds = video_duration_seconds % 60
    duration_str = f"{minutes}:{seconds:02d}"

    prompt_parts = [
        f"Analyze emotion timeline and create intensity arrays for this video.",
        f"",
        f"Video Duration:",
        f"- Total: {duration_str} ({video_duration_seconds} seconds)",
        f"- Required array length: {video_duration_seconds} values per emotion",
        f"",
        f"=== EMOTION_TIMELINE (1-second segments) ===",
        f"For each 1-second segment of video:",
        f"- Identify dominant emotion: Anger, Disgust, Horror, Humor, Sadness, or Surprise",
        f"- Assign intensity level (0.0-1.0, where 1.0 is very strong)",
        f"- Note start and end times (MUST cover the full duration in 1s steps)",
        f"",
        f"=== EMOTION_SEISMOGRAPH (CRITICAL - READ CAREFULLY) ===",
        f"You must create 6 arrays (one per emotion):",
        f"- Anger: array of {video_duration_seconds} intensity values",
        f"- Disgust: array of {video_duration_seconds} intensity values",
        f"- Horror: array of {video_duration_seconds} intensity values",
        f"- Humor: array of {video_duration_seconds} intensity values",
        f"- Sadness: array of {video_duration_seconds} intensity values",
        f"- Surprise: array of {video_duration_seconds} intensity values",
        f"",
        f"ARRAY RULE:",
        f"- Array index = time in seconds",
        f"- Array length = EXACTLY {video_duration_seconds}",
        f"",
        f"Match emotional transitions precisely to visual/audio cues.",
    ]

    return "\n".join(prompt_parts)


def build_character_global_analysis_prompt(video_duration_seconds: int) -> str:
    """Build dynamic prompt for character emotion and global sentiment analysis."""
    minutes = video_duration_seconds // 60
    seconds = video_duration_seconds % 60
    duration_str = f"{minutes}:{seconds:02d}"

    prompt_parts = [
        f"Analyze character emotions and overall sentiment for this video.",
        f"",
        f"Video Duration: {duration_str} ({video_duration_seconds} total seconds)",
        f"",
        f"=== CHARACTER ANALYSIS ===",
        f"For each character/person detected:",
        f"- id: Unique identifier",
        f"- name: Brief description",
        f"- dominant_emotion: [Anger, Disgust, Horror, Humor, Sadness, Surprise]",
        f"- volatility: [Low, Medium, or High]",
        f"- screen_time: Percentage (0.0-100.0) where 100.0 exists if they represent the whole video",
        f"",
        f"=== GLOBAL SENTIMENT ===",
        f"Identify if the video is Positive/Alert, Negative/Concerning, or Neutral/Mixed.",
    ]

    return "\n".join(prompt_parts)
