import streamlit as st
import requests
import time

st.set_page_config(
    page_title="Reel Analysis",
    page_icon="🎬",
    layout="wide"
)

st.title("Social Media Video Analysis Platform")
st.markdown("AI-powered content analysis for Instagram Reels")

API_BASE_URL = "http://localhost:8000"

# Create tabs for different analysis modes
tab1, tab2 = st.tabs(["📱 Analyze Reel URL", "📤 Upload Video"])

# ==================== TAB 1: Reel URL Analysis ====================
with tab1:
    st.subheader("Analyze Instagram Reel")
    st.markdown("Paste an Instagram reel URL to get detailed AI analysis")
    
    reel_url = st.text_input(
        "Instagram Reel URL",
        placeholder="https://www.instagram.com/reel/...",
        help="Paste the full Instagram reel URL"
    )
    
    if st.button("Analyze Reel", disabled=not reel_url, type="primary", use_container_width=True, key="analyze_reel"):
        if reel_url:
            # Create a status container for live updates
            status_container = st.empty()
            progress_bar = st.progress(0)
            
            try:
                # Status: Downloading
                status_container.info("⬇️ **Downloading reel from Instagram...**")
                progress_bar.progress(20)
                time.sleep(0.5)  # Brief pause for UI feedback
                
                # Status: Analyzing
                status_container.info("🔍 **Analyzing video content with AI...**")
                progress_bar.progress(50)
                
                # Make API request
                response = requests.post(
                    f"{API_BASE_URL}/analyze-video/reel",
                    json={"post_url": reel_url},
                    timeout=180  # 3 minute timeout for long videos
                )
                
                progress_bar.progress(90)
                
                if response.status_code == 200:
                    status_container.success("✅ **Analysis complete!**")
                    progress_bar.progress(100)
                    time.sleep(0.5)
                    
                    # Clear status elements
                    status_container.empty()
                    progress_bar.empty()
                    
                    result = response.json()
                    
                    st.divider()
                    
                    # ===== MAIN SUMMARY =====
                    st.subheader("📝 Main Summary")
                    st.write(result.get("main_summary", "Summary not available."))
                    
                    # ===== COMMENTARY / SUMMARY =====
                    st.subheader("💬 Commentary Summary")
                    st.write(result.get("commentary_summary", "No commentary available."))
                    
                    # ===== TRANSCRIPT =====
                    transcript = result.get("transcript")
                    if transcript:
                        st.subheader("🎙️ Transcript")
                        with st.expander("View full transcript", expanded=False):
                            st.text(transcript)
                    
                    # ===== CHARACTERS =====
                    characters = result.get("characters", [])
                    if characters:
                        st.subheader("👥 Characters Detected")
                        for i, char in enumerate(characters, 1):
                            with st.expander(f"Character {i}", expanded=True):
                                cols = st.columns(2)
                                with cols[0]:
                                    st.markdown(f"**Race/Ethnicity:** {char.get('race', 'Unknown')}")
                                    st.markdown(f"**Tone:** {char.get('tone', 'Unknown')}")
                                    st.markdown(f"**Facial Expression:** {char.get('facial_expression', 'Unknown')}")
                                with cols[1]:
                                    st.markdown(f"**Mood:** {char.get('mood', 'Unknown')}")
                                    if char.get('notes'):
                                        st.markdown(f"**Notes:** {char.get('notes')}")
                    
                    # ===== POSSIBLE ISSUES =====
                    issues = result.get("possible_issues", [])
                    if issues:
                        st.subheader("⚠️ Possible Issues / Violations")
                        for issue in issues:
                            st.warning(f"• {issue}")
                    else:
                        st.subheader("✅ Content Check")
                        st.success("No content violations or sensitive topics detected.")
                    
                    # ===== SUGGESTIONS =====
                    suggestions = result.get("suggestions", [])
                    if suggestions:
                        st.subheader("💡 Suggestions & Observations")
                        for suggestion in suggestions:
                            st.info(f"• {suggestion}")
                    
                    # ===== RAW JSON (collapsible) =====
                    with st.expander("🔧 View Raw JSON Response"):
                        st.json(result)
                
                else:
                    status_container.empty()
                    progress_bar.empty()
                    error_detail = response.json().get('detail', 'Unknown error')
                    st.error(f"❌ Error: {error_detail}")
            
            except requests.exceptions.Timeout:
                status_container.empty()
                progress_bar.empty()
                st.error("⏱️ Request timed out. The video may be too long or the server is busy.")
            except requests.exceptions.ConnectionError:
                status_container.empty()
                progress_bar.empty()
                st.error("🔌 Could not connect to the API. Make sure both services are running:\n- FastAPI server on http://localhost:8000\n- Instagram downloader on http://localhost:3333")
            except Exception as e:
                status_container.empty()
                progress_bar.empty()
                st.error(f"❌ An error occurred: {str(e)}")

# ==================== TAB 2: Video Upload ====================
with tab2:
    st.subheader("Upload Video File")
    st.markdown("Upload a video file directly for basic analysis")
    
    uploaded_file = st.file_uploader(
        "Upload Video",
        type=["mp4", "mov", "webm", "avi"],
        help="Supports mp4, mov, webm, avi formats",
        label_visibility="visible"
    )
    
    if st.button("Analyze Video", disabled=not uploaded_file, type="primary", use_container_width=True, key="analyze_upload"):
        if uploaded_file:
            status_container = st.empty()
            progress_bar = st.progress(0)
            
            try:
                status_container.info("📤 **Uploading video...**")
                progress_bar.progress(30)
                
                status_container.info("🔍 **Analyzing video content...**")
                progress_bar.progress(60)
                
                files = {"video": (uploaded_file.name, uploaded_file, uploaded_file.type)}
                response = requests.post(f"{API_BASE_URL}/analyze-video", files=files, timeout=180)
                
                progress_bar.progress(100)
                
                if response.status_code == 200:
                    status_container.success("✅ **Analysis complete!**")
                    time.sleep(0.5)
                    status_container.empty()
                    progress_bar.empty()
                    
                    result = response.json()
                    
                    st.divider()
                    st.subheader("📝 Video Summary")
                    st.write(result.get("summary", "Summary not available."))
                else:
                    status_container.empty()
                    progress_bar.empty()
                    st.error(f"❌ Error: {response.json().get('detail', 'Unknown error')}")
            
            except requests.exceptions.Timeout:
                status_container.empty()
                progress_bar.empty()
                st.error("⏱️ Request timed out. The video may be too long.")
            except requests.exceptions.ConnectionError:
                status_container.empty()
                progress_bar.empty()
                st.error("🔌 Could not connect to the API. Make sure the FastAPI server is running on http://localhost:8000")
            except Exception as e:
                status_container.empty()
                progress_bar.empty()
                st.error(f"❌ An error occurred: {str(e)}")

# Add footer
st.divider()
st.markdown("""
<div style='text-align: center; color: #666; font-size: 12px;'>
  AI-Powered Social Media Content Analysis Platform<br/>
  <small>Powered by Google Gemini</small>
</div>
""", unsafe_allow_html=True)