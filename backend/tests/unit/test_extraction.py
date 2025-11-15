"""Tests for place extraction."""

from unittest.mock import AsyncMock, MagicMock

import pytest

from app.models.place import PlaceType
from app.models.video import Video
from app.agents.extraction import extract_places_from_video
from app.services.llm_client import LLMClient


@pytest.fixture
def sample_video():
    """Create a sample video for testing."""
    return Video(
        video_id="test123",
        title="Paris Food Tour",
        description="Best restaurants in Paris",
        duration_seconds=600,
        transcript="I visited this amazing restaurant called Le Bistro. The food was incredible!",
        url="https://youtube.com/watch?v=test123",
    )


@pytest.fixture
def mock_llm_client():
    """Create a mock LLM client."""
    client = MagicMock(spec=LLMClient)
    client.provider = "openai"

    # Mock the structured output response
    client.invoke_structured = AsyncMock(
        return_value={
            "places": [
                {
                    "name": "Le Bistro",
                    "type": "restaurant",
                    "description": "Amazing French restaurant",
                    "timestamp_seconds": 120,
                    "mentioned_context": "The food was incredible",
                }
            ],
            "suggested_title": "Paris Food Tour",
        }
    )

    return client


@pytest.mark.asyncio
async def test_extract_places_from_video(sample_video, mock_llm_client):
    """Test extracting places from a video."""
    places, suggested_title = await extract_places_from_video(
        sample_video, mock_llm_client
    )

    assert len(places) == 1
    assert places[0].name == "Le Bistro"
    assert places[0].type == PlaceType.RESTAURANT
    assert places[0].video_id == "test123"
    assert places[0].timestamp_seconds == 120
    assert suggested_title == "Paris Food Tour"

    # Verify LLM was called
    mock_llm_client.invoke_structured.assert_called_once()


@pytest.mark.asyncio
async def test_extract_places_with_multiple_results(sample_video, mock_llm_client):
    """Test extracting multiple places from a video."""
    # Mock response with multiple places
    mock_llm_client.invoke_structured = AsyncMock(
        return_value={
            "places": [
                {
                    "name": "Le Bistro",
                    "type": "restaurant",
                    "description": "French restaurant",
                    "timestamp_seconds": 120,
                    "mentioned_context": "Great food",
                },
                {
                    "name": "Eiffel Tower",
                    "type": "attraction",
                    "description": "Iconic landmark",
                    "timestamp_seconds": 300,
                    "mentioned_context": "Must visit",
                },
            ],
            "suggested_title": "Best of Paris",
        }
    )

    places, suggested_title = await extract_places_from_video(
        sample_video, mock_llm_client
    )

    assert len(places) == 2
    assert places[0].name == "Le Bistro"
    assert places[1].name == "Eiffel Tower"
    assert places[0].type == PlaceType.RESTAURANT
    assert places[1].type == PlaceType.ATTRACTION
    assert suggested_title == "Best of Paris"
