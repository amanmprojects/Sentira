---
name: reel-analysis-structured-output
overview: Add structured Gemini analysis for Instagram reels using the downloader service, expose a new backend endpoint, and update the Streamlit UI to show analysis results with live status messages.
todos:
  - id: backend-schema-endpoint
    content: Add structured analysis model + /analyze-reel endpoint in FastAPI
    status: completed
  - id: backend-downloader-integration
    content: Call downloader, download video, send to Gemini
    status: completed
  - id: streamlit-ui-status
    content: Add analyze action + status messages in Streamlit UI
    status: completed
  - id: streamlit-render-results
    content: Render structured analysis fields in Streamlit UI
    status: completed
isProject: false
---

# Plan: Reel Analysis Structured Output

## Context

- Backend API is a FastAPI app in `/home/aman/Code/kalyan-bk-birla/it1` with a video upload endpoint at `/analyze-video`.
- Instagram downloader is a separate Next.js app in `/home/aman/Code/kalyan-bk-birla/it1/insta-downloader` with a server API at `/api/video` on port 3333.

## Backend changes

- Add a new structured response model for analysis in `[ /home/aman/Code/kalyan-bk-birla/it1/routes/video.py ]` with fields:
  - `main_summary` (string)
  - `characters` (array of `{ race, tone, facial_expression, mood, notes }` strings)
  - `commentary_summary` (string)
  - `possible_issues` (array of strings; e.g., racism, homophobia, misogyny, casteism, islamophobia, hinduphobia, etc.)
  - `transcript` (string, optional)
  - `suggestions` (array of strings for app improvement or content context)
- Create a new endpoint (e.g., `POST /analyze-reel`) that accepts a JSON body with `post_url`.
- Implement a downloader call inside the backend:
  - Call `http://localhost:3333/api/video?postUrl=...&enhanced=true` to resolve the reel to a video URL.
  - Download the video to a temp file (streaming) and upload to Gemini as done in `/analyze-video`.
- Update the Gemini prompt and `response_json_schema` to return the structured output; include guidance for transcript extraction from audio when possible.
- Add a small config entry for the downloader base URL (env var with default) in `[ /home/aman/Code/kalyan-bk-birla/it1/config.py ]`.

## Frontend changes (Streamlit)

- Extend the Streamlit app in `[ /home/aman/Code/kalyan-bk-birla/it1/temp-ui/app.py ]` to:
  - Add an “Analyze” action that calls the FastAPI endpoint with the reel URL.
  - Show live status messages in the UI (e.g., “Downloading…”, “Analyzing…”, “Done” / “Failed”).
  - Render the structured analysis results (summary, characters, issues, transcript, suggestions) below the form.

## Dependencies and config

- Add an HTTP client in the FastAPI app (likely `httpx`) for downloader fetch + video download.
- Document any required env vars (`GEMINI_API_KEY`, optional `DOWNLOADER_BASE_URL`).

## Verification

- Manually test: paste a reel URL, observe “Downloading” → “Analyzing” status, and check that structured JSON is rendered in the UI.
- Verify error states when the URL is invalid or the downloader is unavailable.

