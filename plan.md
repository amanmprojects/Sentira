# Sentira: Multimodal Content Intelligence

**Sentira** is a high-performance, AI-driven analysis platform designed to decode the subtext, emotional flux, and factual integrity of social media content. By leveraging Gemini's multimodal capabilities, Sentira provides deep insights into video, audio, and text.

---

## 🎯 Core Vision
Transform passive consumption into active intelligence. Sentira doesn't just "see" video; it understands the emotional narrative, identifies the characters, and verifies the claims in real-time.

---

## 🛠️ System Architecture

### Frontend (Next.js)
- **Pulse Dashboard**: The command center for multimodal ingestion.
- **Visualizations**: Dynamic seismographs, sentiment timelines, and character relationship maps.
- **Aesthetics**: Cyber-glass, aurora accents, and low-latency feedback.

### Backend (FastAPI + Gemini)
- **Parallel Processing Engine**: Uses concurrent LLM calls to reduce analysis latency by ~50%.
- **Multimodal Toolkit**: Integrations for Instagram (Downloader), YouTube (pytubefix), and local uploads.
- **Fact-Checking**: Real-time verification using Google Search grounding.
- **Persistence**: PostgreSQL for reel history (Local caching disabled for real-time accuracy).

---

## 📈 Current Project Status (Audit)

- [x] **Project Identity**: Renamed from Sentiwave to Sentira.
- [x] **Core UI**: Pulse dashboard implemented with multimodal input cards.
- [x] **Authentication**: Clerk integrated for secure access.
- [x] **Reel Ingestion**: Instagram and YouTube downloader services active.
- [x] **Fact-Checking**: Functional verification engine with misinformation filtering.
- [x] **Database**: PostgreSQL integration for storing analyzed reel URLs.
- [x] **Sentiment Analysis**: Refactored with Parallel LLM Streams for high-precision 1-second granularity.
- [x] **Code Modularization**: Broke down `video.py` into `models/`, `prompts/`, and `services/` for better maintainability.

---

## 🚀 Immediate Priority: Sentiment Analysis Engine 2.0

### Objective
Upgrade the `/analyze-video/sentiment` endpoint to use **Parallel Multimodal Streams**. Instead of one broad request, we split the analysis into two specialized parallel calls:
1. **Temporal Stream**: High-frequency emotion tracking (1s grain).
2. **Entity Stream**: Character mapping and global sentiment categorization.

### Phase 1: Model & Schema Update
Add high-precision Pydantic models to `backend/routes/video.py` to support granular results.

```python
class TemporalEmotionAnalysis(BaseModel):
    """LLM Call 1: High-frequency tracking."""
    emotion_timeline: list[EmotionSegment] 
    emotion_seismograph: EmotionSeismograph

class CharacterGlobalAnalysis(BaseModel):
    """LLM Call 2: Context & Entity tracking."""
    character_emotions: list[CharacterEmotion]
    global_category: str
    confidence_score: float
```

### Phase 2: System Instruction Refinement
Split the system prompts into specialized roles:
- **Expert Temporal Analyst**: Focuses exclusively on timestamps, micro-expressions, and intensity shifts.
- **Global Context Analyst**: Focuses on character identity, narrative arc, and overall sentiment.

### Phase 3: Parallel Implementation
Refactor the endpoint to use `asyncio.gather`.

```python
# Pseudo-implementation logic
temporal_task = analyze_stream(myfile, TEMPORAL_PROMPT)
global_task = analyze_stream(myfile, GLOBAL_PROMPT)

temporal_res, global_res = await asyncio.gather(temporal_task, global_task)
```

### Phase 4: Validation & Seismograph Interpolation
- Implement 1:1 mapping between video duration (seconds) and seismograph array length.
- Add validation to ensure every second of the video has an emotional intensity coordinate.

---

## 🗺️ Roadmap (Future Feature Matrix)

### Q1: Enhanced Detection
- [ ] **Cross-Video Character Sync**: recognize the same person across different reels.
- [ ] **Advanced Bias Detection**: Identify "strawman" arguments or "cherry-picking" in political content.
- [ ] **Multilingual Support**: Sentiment analysis for 20+ non-English languages.

### Q2: Interactive Intelligence
- [ ] **Sentira Chat**: A sidebar to ask questions about the video ("Why did the speaker look nervous at 0:15?").
- [ ] **Batch Processing**: Analyze an entire channel or profile at once.
- [ ] **Automated PDF Reports**: High-quality intelligence briefings exported with one click.

### Q3: Platform Expansion
- [ ] **TikTok Integration**: Full support for TikTok video ingestion.
- [ ] **Twitter/X Spaces**: Real-time analysis of live audio conversations.
- [ ] **Browser Extension**: Side-car analysis overlay for social media platforms.

---

## 🎨 Design Principles
1. **Clarity over Clutter**: Despite the high-density data, the UI must feel breathable.
2. **Motion as Meaning**: Transitions should reflect the emotional flux of the content.
3. **Cyber-Industrial Aesthetic**: Use the "Aurora Cyan" and "Rose" palette to denote positive and concerning signals respectively.

---

**Status**: Active Development
**Last Updated**: 2026-01-31 (by Antigravity)
