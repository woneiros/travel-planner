"""YouTube transcript and metadata fetching service."""

import re
from urllib.parse import parse_qs, urlparse

from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import (
    NoTranscriptFound,
    TranscriptsDisabled,
    VideoUnavailable,
)

from app.models.video import Video
from app.observability.langfuse_client import observe, get_langfuse
from app.utils.errors import YouTubeTranscriptError
from app.utils.logger import setup_logger

logger = setup_logger(__name__)
lf = get_langfuse()


def extract_video_id(url: str) -> str:
    """
    Extract video ID from various YouTube URL formats.

    Args:
        url: YouTube URL

    Returns:
        Video ID

    Raises:
        ValueError: If URL format is invalid
    """
    # Remove whitespace
    url = url.strip()

    # Regex patterns for different YouTube URL formats
    patterns = [
        r"(?:youtube\.com/watch\?v=|youtu\.be/|youtube\.com/embed/)([^&\?/]+)",
        r"youtube\.com/v/([^&\?/]+)",
    ]

    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)

    # Try parsing query parameters as fallback
    try:
        parsed_url = urlparse(url)
        if "youtube.com" in parsed_url.netloc:
            query_params = parse_qs(parsed_url.query)
            if "v" in query_params:
                return query_params["v"][0]
    except Exception:
        pass

    raise ValueError(f"Could not extract video ID from URL: {url}")


@observe(as_type="tool")
async def fetch_transcript(video_id: str) -> str:
    """
    Fetch transcript for a YouTube video.

    Args:
        video_id: YouTube video ID

    Returns:
        Full transcript text

    Raises:
        YouTubeTranscriptError: If transcript cannot be fetched
    """
    try:
        # Try to get English transcript first, then fall back to any available
        transcript_data = YouTubeTranscriptApi().fetch(video_id, languages=["en"])

        # Combine all text segments
        full_text = " ".join([entry.text for entry in transcript_data])

        # span.set_attribute("transcript.length", len(full_text))
        logger.info(
            f"Fetched transcript for video {video_id}, length: {len(full_text)}"
        )

        lf.update_current_span(metadata={"transcript.length": len(full_text)})
        return full_text

    except (NoTranscriptFound, TranscriptsDisabled) as e:
        error_msg = f"Transcript not available for video {video_id}: {str(e)}"
        logger.error(error_msg)
        raise YouTubeTranscriptError(error_msg) from e

    except VideoUnavailable as e:
        error_msg = f"Video {video_id} is unavailable: {str(e)}"
        logger.error(error_msg)
        raise YouTubeTranscriptError(error_msg) from e

    except Exception as e:
        error_msg = f"Unexpected error fetching transcript for {video_id}: {str(e)}"
        logger.error(error_msg)
        raise YouTubeTranscriptError(error_msg) from e


async def fetch_video_metadata(video_id: str, url: str) -> dict:
    """
    Fetch video metadata (title, description, duration).

    Note: For MVP, we use placeholder values. In production, this would
    call the YouTube Data API v3 to get actual metadata.

    Args:
        video_id: YouTube video ID
        url: Full YouTube URL

    Returns:
        Dictionary with metadata
    """
    # TODO: Implement YouTube Data API v3 integration
    # For now, return placeholder data
    return {
        "video_id": video_id,
        "title": f"Video {video_id}",
        "description": None,
        "duration_seconds": 600,  # Placeholder: 10 minutes
        "url": url,
    }


@observe(as_type="tool")
async def process_video(url: str) -> Video:
    """
    Process a YouTube video: extract ID, fetch transcript and metadata.

    Args:
        url: YouTube URL

    Returns:
        Video model with all data

    Raises:
        ValueError: If URL is invalid
        YouTubeTranscriptError: If transcript cannot be fetched
    """
    # Extract video ID
    video_id = extract_video_id(url)
    # span.set_attribute("video.id", video_id)

    logger.info(f"Processing video: {video_id}")

    # Fetch transcript
    transcript = await fetch_transcript(video_id)

    # Fetch metadata
    metadata = await fetch_video_metadata(video_id, url)

    # Create Video model
    video = Video(
        video_id=video_id,
        title=metadata["title"],
        description=metadata["description"],
        duration_seconds=metadata["duration_seconds"],
        transcript=transcript,
        url=url,
    )

    logger.info(f"Successfully processed video: {video_id}")
    return video
