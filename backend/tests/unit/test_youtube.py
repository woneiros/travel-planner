"""Tests for YouTube service."""

import pytest

from app.services.youtube import extract_video_id
from app.utils.errors import YouTubeTranscriptError


class TestExtractVideoId:
    """Tests for video ID extraction from URLs."""

    def test_extract_from_watch_url(self):
        """Test extracting from standard watch URL."""
        url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        assert extract_video_id(url) == "dQw4w9WgXcQ"

    def test_extract_from_short_url(self):
        """Test extracting from youtu.be short URL."""
        url = "https://youtu.be/dQw4w9WgXcQ"
        assert extract_video_id(url) == "dQw4w9WgXcQ"

    def test_extract_from_short_url_with_params(self):
        """Test extracting from youtu.be short URL."""
        url = "https://youtu.be/dGHezUZ51lQ?si=EcqzJFv5hf--fWDD"
        assert extract_video_id(url) == "dGHezUZ51lQ"

    def test_extract_from_embed_url(self):
        """Test extracting from embed URL."""
        url = "https://www.youtube.com/embed/dQw4w9WgXcQ"
        assert extract_video_id(url) == "dQw4w9WgXcQ"

    def test_extract_with_additional_params(self):
        """Test extracting when URL has additional parameters."""
        url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10s"
        assert extract_video_id(url) == "dQw4w9WgXcQ"

    def test_invalid_url_raises_error(self):
        """Test that invalid URLs raise ValueError."""
        with pytest.raises(ValueError):
            extract_video_id("https://not-youtube.com/somepage")

    def test_missing_video_id_raises_error(self):
        """Test that URLs without video ID raise ValueError."""
        with pytest.raises(ValueError):
            extract_video_id("https://www.youtube.com/")
