"""
YouTube Video Downloader Service

Uses pytubefix to download YouTube videos including Shorts.
pytubefix is a community-maintained fork of pytube that handles
frequent YouTube site changes.
"""

from pytubefix import YouTube
from pytubefix.exceptions import (
    VideoUnavailable,
    AgeRestrictedError,
    VideoPrivate,
    MembersOnly,
    RegexMatchError
)
from typing import Optional
import logging
from io import BytesIO

logger = logging.getLogger(__name__)


class YouTubeDownloader:
    """Service for downloading YouTube videos and Shorts."""

    def __init__(self):
        self.supported_domains = [
            'youtube.com',
            'www.youtube.com',
            'm.youtube.com',
            'youtu.be',
            'youtube-nocookie.com'
        ]

    def is_youtube_url(self, url: str) -> bool:
        """Check if the URL is a valid YouTube URL."""
        from urllib.parse import urlparse
        parsed = urlparse(url)
        return parsed.netloc.lower() in self.supported_domains

    def normalize_url(self, url: str) -> str:
        """Convert short URLs (youtu.be) to full URLs."""
        from urllib.parse import urlparse, urlunparse, urlencode, parse_qs
        parsed = urlparse(url)

        # Handle youtu.be short URLs
        if parsed.netloc == 'youtu.be' and parsed.path.startswith('/'):
            video_id = parsed.path[1:]  # Remove leading '/'
            query = parse_qs(parsed.query)
            # Preserve timestamp (t) parameter if present
            time_param = query.get('t', [None])[0]

            new_url = urlunparse((
                'https',
                'www.youtube.com',
                '/watch',
                '',
                urlencode({'v': video_id, **({} if not time_param else {'t': time_param})}),
                ''
            ))
            return new_url

        return url

    def download_video_bytes(
        self,
        url: str,
        max_quality: str = "720p"
    ) -> tuple[bytes, str, dict]:
        """
        Download a YouTube video and return bytes with metadata.

        Args:
            url: YouTube video URL
            max_quality: Maximum resolution (e.g., "720p", "480p")

        Returns:
            Tuple of (video_bytes, filename, metadata_dict)

        Raises:
            ValueError: For invalid URLs or download failures
            VideoUnavailable: When video cannot be accessed
            AgeRestrictedError: For age-restricted content
        """
        url = self.normalize_url(url)

        if not self.is_youtube_url(url):
            raise ValueError(f"Invalid YouTube URL: {url}")

        try:
            video = YouTube(url)

            metadata = {
                'title': video.title,
                'author': video.author,
                'length': video.length,
                'views': video.views,
                'publish_date': str(video.publish_date) if video.publish_date else None,
                'thumbnail_url': video.thumbnail_url,
                'video_id': video.video_id,
            }

            logger.info(f"Downloading: {metadata['title']} by {metadata['author']}")

            # Try to get progressive stream (audio + video together)
            # These have max quality of 720p but work without FFmpeg
            streams = video.streams.filter(
                progressive=True,
                file_extension='mp4'
            ).order_by('resolution')

            # Get the highest quality <= max_quality
            stream = None
            for s in streams.desc():
                if s.resolution:
                    res_num = int(s.resolution.replace('p', ''))
                    max_res_num = int(max_quality.replace('p', ''))
                    if res_num <= max_res_num:
                        stream = s
                        break

            if not stream:
                # Fallback to any progressive stream
                stream = streams.last()

            if not stream:
                raise ValueError("No suitable video stream found")

            metadata['resolution'] = stream.resolution
            metadata['fps'] = stream.fps if stream.fps else None
            metadata['file_size'] = stream.filesize_mb

            # Download video to bytes
            buffer = BytesIO()
            stream.stream_to_buffer(buffer)
            video_bytes = buffer.getvalue()

            filename = f"{video.title}.mp4".replace('/', '-').replace('\\', '-')

            logger.info(f"Downloaded {len(video_bytes)} bytes at {stream.resolution}")
            return video_bytes, filename, metadata

        except AgeRestrictedError:
            logger.error(f"Age-restricted video: {url}")
            raise
        except VideoUnavailable:
            logger.error(f"Video unavailable: {url}")
            raise
        except (VideoPrivate, MembersOnly):
            logger.error(f"Video is private or members-only: {url}")
            raise ValueError("Video is private or requires membership")
        except RegexMatchError:
            logger.error(f"Invalid YouTube URL format: {url}")
            raise ValueError("Invalid YouTube URL format")
        except Exception as e:
            logger.exception(f"Failed to download video: {url}")
            raise ValueError(f"Failed to download video: {str(e)}")

    def get_video_info(self, url: str) -> Optional[dict]:
        """Get video metadata without downloading."""
        try:
            url = self.normalize_url(url)
            if not self.is_youtube_url(url):
                return None

            video = YouTube(url)

            # Get available streams
            progressive_streams = list(video.streams.filter(
                progressive=True,
                file_extension='mp4'
            ).order_by('resolution').desc())

            return {
                'title': video.title,
                'author': video.author,
                'length': video.length,
                'views': video.views,
                'publish_date': str(video.publish_date) if video.publish_date else None,
                'thumbnail_url': video.thumbnail_url,
                'video_id': video.video_id,
                'available_qualities': [s.resolution for s in progressive_streams if s.resolution],
                'duration_seconds': video.length,
            }
        except Exception as e:
            logger.error(f"Failed to get video info: {e}")
            return None


# Singleton instance
_youtube_downloader = YouTubeDownloader()


def get_youtube_downloader() -> YouTubeDownloader:
    """Get the singleton YouTube downloader instance."""
    return _youtube_downloader
