import streamlit as st
import requests
import time
from datetime import datetime

# Import database functions
from database import init_database, save_reel, get_recent_reels, check_url_exists, delete_reel, update_reel_name, invalidate_cache

# Initialize database on app start
try:
    init_database()
    db_connected = True
except Exception as e:
    db_connected = False
    db_error = str(e)

st.set_page_config(
    page_title="Reel Analysis",
    page_icon="🎬",
    layout="wide"
)

API_BASE_URL = "http://localhost:8000"

# ==================== SIDEBAR: Recent Reels ====================
with st.sidebar:
    st.header("📚 Recent Reels")
    
    if not db_connected:
        st.error(f"Database connection failed: {db_error}")
    else:
        # Refresh button
        if st.button("🔄 Refresh", use_container_width=True):
            st.rerun()
        
        st.divider()
        
        # Get recent reels
        recent_reels = get_recent_reels(limit=20)
        
        if not recent_reels:
            st.caption("No reels analyzed yet. Start by analyzing a reel!")
        else:
            for reel in recent_reels:
                reel_id = reel['id']
                reel_url = reel['url']
                reel_name = reel['name'] or f"Reel #{reel_id}"
                created_at = reel['created_at']
                
                # Format the timestamp
                if isinstance(created_at, datetime):
                    time_str = created_at.strftime("%b %d, %I:%M %p")
                else:
                    time_str = str(created_at)[:16]
                
                with st.container(border=True):
                    # Display name and time
                    st.markdown(f"**{reel_name}**")
                    st.caption(f"🕒 {time_str}")
                    
                    # Action buttons
                    col1, col2 = st.columns([1, 1])
                    
                    with col1:
                        if st.button("📋 Load", key=f"load_{reel_id}", use_container_width=True):
                            st.session_state['load_reel_url'] = reel_url
                            st.rerun()
                    
                    with col2:
                        if st.button("🗑️", key=f"del_{reel_id}", use_container_width=True):
                            delete_reel(reel_id)
                            st.rerun()
    
    st.divider()
    st.caption("💡 Tip: Click 'Load' to use a previous reel URL")

# ==================== MAIN CONTENT ====================
st.title("Social Media Video Analysis Platform")
st.markdown("AI-powered content analysis for Instagram Reels")

# Create tabs for different analysis modes
tab1, tab2 = st.tabs(["📱 Analyze Reel URL", "📤 Upload Video"])

# ==================== TAB 1: Reel URL Analysis ====================
with tab1:
    st.subheader("Analyze Instagram Reel")
    st.markdown("Paste an Instagram reel URL to get detailed AI analysis")
    
    # Initialize session state for inputs if not exists
    if 'reel_url_input' not in st.session_state:
        st.session_state.reel_url_input = ''
    if 'reel_name_input' not in st.session_state:
        st.session_state.reel_name_input = ''
    
    # Check if we should load a URL from sidebar (set by Load button)
    if 'load_reel_url' in st.session_state:
        st.session_state.reel_url_input = st.session_state.load_reel_url
        del st.session_state['load_reel_url']
    
    # URL input and optional name
    col_url, col_name = st.columns([3, 1])
    
    with col_url:
        reel_url = st.text_input(
            "Instagram Reel URL",
            key="reel_url_input",
            placeholder="https://www.instagram.com/reel/...",
            help="Paste the full Instagram reel URL"
        )
    
    with col_name:
        reel_name = st.text_input(
            "Name (optional)",
            key="reel_name_input",
            placeholder="e.g., Funny cat video",
            help="Give this reel a memorable name"
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
                    
                    # Save to database if connected
                    if db_connected:
                        try:
                            # Check if URL already exists
                            existing = check_url_exists(reel_url)
                            if not existing:
                                save_reel(reel_url, reel_name if reel_name else None)
                                invalidate_cache()  # Clear cache so sidebar updates
                                st.toast("📚 Reel saved to history!", icon="✅")
                            elif reel_name and not existing.get('name'):
                                # Update name if provided and not already set
                                update_reel_name(existing['id'], reel_name)
                                invalidate_cache()
                        except Exception as db_err:
                            st.warning(f"Could not save to history: {db_err}")
                    
                    # Clear status elements
                    status_container.empty()
                    progress_bar.empty()
                    
                    result = response.json()

                    st.divider()

                    # Create result tabs
                    result_tabs = st.tabs(["📋 Overview", "👥 Characters", "⚠️ Issues & Tips", "🔞 Age Ratings", "🎙️ Transcript"])

                    # Tab: Overview
                    with result_tabs[0]:
                        st.subheader("📝 Main Summary")
                        st.write(result.get("main_summary", "Summary not available."))

                        st.divider()
                        st.subheader("💬 Commentary Summary")
                        st.write(result.get("commentary_summary", "No commentary available."))

                    # Tab: Characters
                    with result_tabs[1]:
                        st.subheader("👥 Characters Detected")
                        characters = result.get("characters", [])
                        if characters:
                            # Grid layout: 2 or 3 per row
                            cols_per_row = 2 if len(characters) <= 4 else 3

                            for i in range(0, len(characters), cols_per_row):
                                char_cols = st.columns(cols_per_row, gap="medium")

                                for j in range(cols_per_row):
                                    idx = i + j
                                    if idx < len(characters):
                                        char = characters[idx]
                                        with char_cols[j]:
                                            with st.container(border=True):
                                                st.markdown(f"**Character {idx + 1}**")
                                                cols = st.columns(2)
                                                with cols[0]:
                                                    st.metric("Race", char.get('race', 'Unknown'))
                                                    st.metric("Tone", char.get('tone', 'Unknown'))
                                                with cols[1]:
                                                    st.metric("Expression", char.get('facial_expression', 'Unknown'))
                                                    st.metric("Mood", char.get('mood', 'Unknown'))
                                                if char.get('notes'):
                                                    st.caption(f"Note: {char.get('notes')}")
                        else:
                            st.caption("No characters detected")

                    # Tab: Issues & Tips
                    with result_tabs[2]:
                        col1, col2 = st.columns([1, 1], gap="large")

                        with col1:
                            issues = result.get("possible_issues", [])
                            if issues:
                                st.subheader("⚠️ Possible Issues")
                                with st.container(border=True):
                                    for issue in issues:
                                        st.warning(issue, icon="⚠️")
                            else:
                                st.subheader("✅ Content Check")
                                st.success("No violations detected", icon="✅")

                        with col2:
                            suggestions = result.get("suggestions", [])
                            if suggestions:
                                st.subheader("💡 Suggestions")
                                with st.container(border=True):
                                    for suggestion in suggestions:
                                        st.info(suggestion, icon="💡")
                            else:
                                st.caption("No additional suggestions")

                    # Tab: Age Ratings
                    with result_tabs[3]:
                        st.subheader("🔞 Age Suitability Rating")

                        issues = result.get("possible_issues", [])

                        # Determine rating based on issues
                        if not issues:
                            st.success("Safe for All Ages", icon="✅")
                            st.caption("No content violations or sensitive topics detected")
                        elif len(issues) <= 2 and not any(
                            k in str(issues).lower() for k in ["explicit", "violence", "adult", "graphic", "nudity"]
                        ):
                            st.warning("Suitable for Ages 13+", icon="⚠️")
                            st.caption("Contains mild content; parental guidance recommended")
                        else:
                            st.error("Recommended for 18+ Only", icon="🔞")
                            st.caption("Contains mature themes or explicit content")

                    # Tab: Transcript
                    with result_tabs[4]:
                        transcript = result.get("transcript")
                        if transcript:
                            st.subheader("🎙️ Full Transcript")
                            st.text_area("Transcript", value=transcript, height=400, disabled=True)
                        else:
                            st.caption("No transcript available")

                    # Raw JSON at bottom (always visible)
                    st.divider()
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
                    with st.container(border=True):
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