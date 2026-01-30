from google import genai
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from project root (parent of backend/)
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY environment variable is not set")

model = os.getenv("GEMINI_MODEL", "gemini-3-flash-preview")

client = genai.Client(api_key=api_key)

# Instagram downloader service base URL
DOWNLOADER_BASE_URL = os.getenv("DOWNLOADER_BASE_URL", "http://localhost:3333")
