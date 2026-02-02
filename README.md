<p align="center">
  <img src="https://img.shields.io/badge/Status-Active%20Development-00f2fe?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/Next.js-16.1.6-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/FastAPI-Python-009688?style=for-the-badge&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Gemini-AI%20Powered-4285F4?style=for-the-badge&logo=google" alt="Gemini" />
</p>

<h1 align="center">🌀 SENTIRA</h1>
<h3 align="center">Multimodal Content Intelligence Platform</h3>

<p align="center">
  <em>Transform passive consumption into active intelligence.</em><br/>
  Decode the subtext, emotional flux, and factual integrity of social media content.
</p>

---

## 🎯 Overview

**Sentira** is a high-performance, AI-driven analysis platform that leverages Google's Gemini multimodal capabilities to provide deep insights into video, audio, and text content. It doesn't just "see" video — it understands the emotional narrative, identifies characters, detects bias, and verifies claims in real-time.

### Key Capabilities

| Feature | Description |
|---------|-------------|
| 🎭 **Sentiment Analysis** | Real-time emotional tracking with 1-second granularity using parallel LLM streams |
| ✅ **Fact-Checking** | Claim verification engine with Google Search grounding |
| ⚖️ **Bias Detection** | Neural risk vectors, policy conflict analysis, and regional heatmaps |
| 📈 **Trend Analysis** | Virality scoring, audience segmentation, and engagement prediction |
| 🤖 **AI Detection** | Content authenticity verification |
| 📊 **Report Generation** | Exportable PDF intelligence briefings |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         SENTIRA                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌──────────────────┐     │
│  │  Frontend   │    │   Backend   │    │ Insta-Downloader │     │
│  │  (Next.js)  │◄──►│  (FastAPI)  │◄──►│    (Next.js)     │     │
│  │  Port 3001  │    │  Port 8000  │    │    Port 3333     │     │
│  └─────────────┘    └──────┬──────┘    └──────────────────┘     │
│                            │                                     │
│                            ▼                                     │
│                   ┌────────────────┐                            │
│                   │  Gemini AI     │                            │
│                   │  (Multimodal)  │                            │
│                   └────────────────┘                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS, Framer Motion |
| **Backend** | FastAPI, Python, Google Gemini AI |
| **Authentication** | Clerk |
| **Database** | PostgreSQL |
| **Video Sources** | Instagram (custom downloader), YouTube (pytubefix) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ 
- **Python** 3.10+
- **PostgreSQL** (optional, for persistence)
- **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/)
- **Clerk Account** for authentication

### Environment Variables

Create a `.env` file in the project root:

```env
# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3-flash-preview
GEMINI_BIAS_MODEL=gemini-3-pro-preview

# Service URLs
DOWNLOADER_BASE_URL=http://localhost:3333

# Frontend (.env.local in /frontend)
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/sentira.git
cd sentira
```

#### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
.\venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Or using pnpm
pnpm install
```

#### 4. Instagram Downloader Setup (Optional)

```bash
cd insta-downloader

# Install dependencies
npm install
```

### Running the Application

Open three terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
uvicorn main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - Instagram Downloader (Optional):**
```bash
cd insta-downloader
npm run dev
```

Access the application at **http://localhost:3001**

---

## 📁 Project Structure

```
Sentira/
├── backend/                    # FastAPI Backend
│   ├── main.py                 # Application entry point
│   ├── config.py               # Configuration & Gemini client
│   ├── cache.py                # Caching utilities
│   ├── models/                 # Pydantic data models
│   │   └── video.py
│   ├── prompts/                # LLM prompt templates
│   │   └── video.py
│   ├── services/               # Business logic
│   │   ├── video_service.py
│   │   ├── fact_checker.py
│   │   └── youtube_downloader.py
│   └── routes/                 # API endpoints
│       ├── video.py
│       ├── videos.py
│       ├── fact_check.py
│       └── root.py
│
├── frontend/                   # Next.js Frontend
│   └── src/
│       ├── app/                # App router pages
│       │   ├── dashboard/      # Main input hub
│       │   ├── analyze/        # Video analysis
│       │   ├── sentiment-analysis/
│       │   ├── detecting-bias/
│       │   ├── fact-checking/
│       │   ├── trend-analysis/
│       │   ├── ai-detection/
│       │   ├── browse/
│       │   ├── reports/
│       │   └── history/
│       ├── components/         # Reusable UI components
│       ├── context/            # React context (AnalysisContext)
│       ├── lib/                # Utilities & API client
│       └── types/              # TypeScript definitions
│
└── insta-downloader/           # Instagram video downloader service
    └── src/
        ├── app/
        ├── features/
        └── services/
```

---

## 🔌 API Endpoints

### Video Analysis

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/analyze-video/reel` | Analyze Instagram reel from URL |
| `POST` | `/analyze-video/youtube` | Analyze YouTube video from URL |
| `POST` | `/analyze-video/sentiment` | Get sentiment analysis with emotion timeline |
| `POST` | `/analyze-video/reel/upload` | Analyze uploaded video file |

### Fact Checking

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/fact-check` | Verify claims in content |

### Video Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/videos` | List analyzed videos |
| `GET` | `/videos/{id}` | Get specific video analysis |

---

## 🎨 Design System

### Color Palette

| Name | Hex | Usage |
|------|-----|-------|
| **Aurora Cyan** | `#00f2fe` | Positive signals, CTAs |
| **Aurora Rose** | `#ff0080` | Warnings, concerning signals |
| **Aurora Blue** | `#00d4ff` | Neutral highlights |
| **Background** | `#020617` | Primary dark background |

### Design Principles

1. **Clarity over Clutter** — High-density data with breathable UI
2. **Motion as Meaning** — Transitions reflect emotional content flux
3. **Cyber-Industrial Aesthetic** — Glass morphism with aurora accents

---

## 🛣️ Roadmap

### ✅ Completed
- [x] Core UI with Pulse dashboard
- [x] Clerk authentication integration
- [x] Instagram & YouTube video ingestion
- [x] Fact-checking verification engine
- [x] Sentiment analysis with parallel LLM streams
- [x] Bias detection with regional heatmaps
- [x] PDF report generation

### 🔄 In Progress
- [ ] Cross-video character recognition
- [ ] Advanced bias detection (strawman, cherry-picking)
- [ ] Multilingual support (20+ languages)

### 📋 Planned
- [ ] Sentira Chat (interactive Q&A about videos)
- [ ] Batch processing for channels/profiles
- [ ] TikTok integration
- [ ] Twitter/X Spaces analysis
- [ ] Browser extension overlay

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---


<p align="center">
  <sub>Built with ❤️ for truth, transparency, and multimodal intelligence.</sub>
</p>
