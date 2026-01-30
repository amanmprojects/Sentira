import streamlit as st
import requests

st.set_page_config(
    page_title="Video Analysis",
    page_icon="🎬",
    layout="wide"
)

st.title("Social Media Video Analysis Platform")
st.markdown("AI-powered content analysis for short-form video content")

# File upload
uploaded_file = st.file_uploader(
    "Upload Video",
    type=["mp4", "mov", "webm", "avi"],
    help="Supports mp4, mov, webm, avi formats",
    label_visibility="visible"
)

API_URL = "http://localhost:8000/analyze-video"

if st.button("Analyze Video", disabled=not uploaded_file, type="primary", use_container_width=True):
    if uploaded_file:
        with st.spinner("Processing video..."):
            try:
                files = {"video": (uploaded_file.name, uploaded_file, uploaded_file.type)}
                response = requests.post(API_URL, files=files)

                if response.status_code == 200:
                    result = response.json()

                    st.divider()

                    # ===== SUMMARY SECTION =====
                    st.subheader("📝 Video Summary")
                    st.write(result.get("summary", "Summary not available."))

                else:
                    st.error(f"Error: {response.json().get('detail', 'Unknown error')}")

            except requests.exceptions.ConnectionError:
                st.error("Could not connect to the API. Make sure the FastAPI server is running on http://localhost:8000")
            except Exception as e:
                st.error(f"An error occurred: {str(e)}")

# Add footer
st.divider()
st.markdown("""
<div style='text-align: center; color: #666; font-size: 12px;'>
  AI-Powered Social Media Content Analysis Platform
</div>
""", unsafe_allow_html=True)