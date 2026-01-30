import streamlit as st
import requests

st.set_page_config(
    page_title="Video Analysis",
    page_icon="🎬",
    layout="wide"
)

# Custom CSS for better styling
st.markdown("""
<style>
    .metric-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px;
        border-radius: 10px;
        margin: 10px 0;
    }
    .warning-box {
        background: #fff5f5;
        border-left: 4px solid #e53e3e;
        padding: 15px;
        border-radius: 5px;
    }
    .success-box {
        background: #f0fff4;
        border-left: 4px solid #38a169;
        padding: 15px;
        border-radius: 5px;
    }
    .info-box {
        background: #ebf8ff;
        border-left: 4px solid #4299e1;
        padding: 15px;
        border-radius: 5px;
    }
</style>
""", unsafe_allow_html=True)

st.title("Social Media Video Analysis Platform")
st.markdown("Advanced AI-powered analysis for short-form video content")

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
        with st.spinner("Processing video... This may take a minute."):
            try:
                files = {"video": (uploaded_file.name, uploaded_file, uploaded_file.type)}
                response = requests.post(API_URL, files=files)

                if response.status_code == 200:
                    result = response.json()

                    st.divider()

                    # ===== TOP METRICS ROW =====
                    st.subheader("At a Glance")
                    col1, col2, col3, col4, col5, col6 = st.columns(6)

                    with col1:
                        sentiment_emoji = {"positive": "😊", "negative": "😠", "neutral": "😐", "mixed": "🤔"}
                        st.metric("Sentiment", sentiment_emoji.get(result.get("sentiment"), "❓") + " " + result.get("sentiment", "Unknown"))

                    with col2:
                        bias_level = result.get("overall_bias_level", "unknown")
                        bias_emojis = {"none": "✅", "low": "⚠️", "moderate": "🔶", "high": "🔴", "severe": "🚨"}
                        st.metric("Bias Level", bias_emojis.get(bias_level, "❓") + " " + bias_level.title())

                    with col3:
                        viral = result.get("viral_potential", "unknown")
                        viral_emojis = {"low": "📉", "medium": "📊", "high": "📈", "very_high": "🚀"}
                        st.metric("Viral Potential", viral_emojis.get(viral, "❓") + " " + viral.title())

                    with col4:
                        target = result.get("target_audience", "unknown").replace("_", " ").title()
                        st.metric("Target Audience", target)

                    with col5:
                        quality = result.get("production_quality", "unknown").title()
                        prod_emojis = {"low": "📱", "medium": "🎥", "high": "🎬", "professional": "🏆"}
                        st.metric("Quality", prod_emojis.get(quality.lower(), "❓") + " " + quality)

                    with col6:
                        badge_emoji = "⚠️" if result.get("flagged_content") else "✓"
                        st.metric("Flagged", badge_emoji, result.get("flagged_content", False))

                    # ===== CONTENT WARNINGS =====
                    if result.get("flagged_content") or result.get("content_warnings"):
                        st.warning("Content Warning")
                        warnings = result.get("content_warnings", [])
                        for warning in warnings:
                            st.markdown(f"""<div class="warning-box">⚠️ {warning}</div>""", unsafe_allow_html=True)

                    st.divider()

                    # ===== DETAILED SECTIONS =====
                    col_left, col_right = st.columns(2)

                    with col_left:
                        # ===== SUMMARY & KEY TAKEAWAYS =====
                        st.subheader("📝 Summary")
                        st.write(result.get("summary", "Summary not available."))

                        if result.get("key_takeaways"):
                            st.subheader("✨ Key Takeaways")
                            for i, takeaway in enumerate(result.get("key_takeaways", []), 1):
                                st.write(f"{i}. {takeaway}")

                        st.divider()

                        # ===== SENTIMENT ANALYSIS =====
                        st.subheader("😌 Sentiment Analysis")
                        col_emotion, col_intensity = st.columns(2)

                        with col_emotion:
                            em_emoji = {
                                "joy": "😄", "sadness": "😢", "anger": "😠",
                                "fear": "😨", "disgust": "🤢", "surprise": "😲",
                                "anticipation": "🤔", "trust": "🤝", "neutral": "😐"
                            }
                            primary = result.get("primary_emotion", "neutral")
                            st.metric("Primary Emotion", em_emoji.get(primary, "❓") + " " + primary.title())

                        with col_intensity:
                            intensity = result.get("sentiment", "neutral")  # Using sentiment as proxy for now
                            st.metric("Emotional Tone", intensity.title())

                        st.divider()

                        # ===== CONTENT CATEGORY =====
                        st.subheader("📂 Content Category")
                        st.markdown(f"""<div class="info-box">Target Audience: <strong>{result.get("target_audience", "N/A").replace("_", " ").title()}</strong></div>""", unsafe_allow_html=True)

                    with col_right:
                        # ===== BIAS ANALYSIS =====
                        st.subheader("⚖️ Bias & Credibility Analysis")
                        bias_level = result.get("overall_bias_level", "none")
                        if bias_level == "none":
                            st.markdown("""<div class="success-box">✅ No significant bias detected</div>""", unsafe_allow_html=True)
                        else:
                            st.markdown(f"<div class='warning-box'>⚠️ Bias Level: {bias_level.title()}</div>", unsafe_allow_html=True)

                        # Credibility Flags
                        flags = result.get("credibility_flags", [])
                        if flags:
                            st.write("**Credibility Flags Detected:**")
                            for flag in flags:
                                flag_formatted = flag.replace("_", " ").title()
                                st.markdown(f"- `{flag_formatted}`")

                        # Bias Techniques
                        techniques = result.get("bias_techniques", [])
                        if techniques:
                            st.write("**Specific Techniques Found:**")
                            for tech in techniques:
                                severity_badges = {
                                    "low": "🟢", "medium": "🟡", "high": "🟠", "critical": "🔴"
                                }
                                badge = severity_badges.get(tech.get("severity", "medium"), "⚪")
                                technique_name = tech.get("technique", "").replace("_", " ").replace("-", " ").title()
                                st.markdown(f"- {badge} **{technique_name}** (Severity: {tech.get('severity', 'unknown')})")
                                st.markdown(f"  _{tech.get('description', '')}_")

                        st.divider()

                        # ===== KEY TRENDS =====
                        st.subheader("📈 Trends & Social Dynamics")
                        trends = result.get("key_trends", [])
                        if trends:
                            for trend in trends:
                                st.write(f"- {trend}")
                        else:
                            st.write("No specific trends identified.")

                        st.divider()

                        # ===== ENGAGEMENT DRIVERS =====
                        st.subheader("💬 Engagement Drivers")
                        drivers = result.get("engagement_drivers", [])
                        if drivers:
                            for driver in drivers:
                                st.write(f"- {driver}")
                        else:
                            st.write("No specific engagement factors identified.")

                        st.divider()

                        # ===== SOCIAL DYNAMICS =====
                        st.subheader("👥 Social Dynamics")
                        dynamics = result.get("social_dynamics", [])
                        if dynamics:
                            for dynamic in dynamics:
                                dynamic_formatted = dynamic.replace("_", " ").title()
                                st.write(f"- {dynamic_formatted}")
                        else:
                            st.write("No social dynamics identified.")

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
