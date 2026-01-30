from google import genai
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY environment variable is not set")

client = genai.Client(api_key=api_key)

# Instagram downloader service base URL
DOWNLOADER_BASE_URL = os.getenv("DOWNLOADER_BASE_URL", "http://localhost:3333")
