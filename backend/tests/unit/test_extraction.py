"""Tests for place extraction."""

from unittest.mock import AsyncMock, MagicMock

import pytest

from app.agents.extraction import (
    ExtractedPlace,
    LLMExtractionResult,
    PlaceExtractionResult,
    extract_places_from_video,
)
from app.models.place import Place, PlaceType
from app.models.video import Video
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
        return_value=LLMExtractionResult(
            places=[
                ExtractedPlace(
                    name="Le Bistro",
                    type=PlaceType.RESTAURANT,
                    description="Amazing French restaurant",
                    timestamp_seconds=120,
                    mentioned_context="The food was incredible",
                )
            ],
            suggested_title="Paris Food Tour",
            suggested_summary="A delightful tour of Parisian cuisine.",
        )
    )

    return client


@pytest.mark.asyncio
async def test_extract_places_from_video(sample_video, mock_llm_client):
    """Test extracting places from a video."""
    extraction = await extract_places_from_video(sample_video, mock_llm_client)

    places = extraction.places
    suggested_title = extraction.suggested_title
    suggested_summary = extraction.suggested_summary
    assert len(places) == 1
    assert places[0].name == "Le Bistro"
    assert places[0].type == PlaceType.RESTAURANT
    assert places[0].video_id == "test123"
    assert places[0].timestamp_seconds == 120
    assert suggested_title == "Paris Food Tour"
    assert suggested_summary == "A delightful tour of Parisian cuisine."

    # Verify LLM was called
    mock_llm_client.invoke_structured.assert_called_once()


@pytest.mark.asyncio
async def test_extract_places_with_multiple_results(sample_video, mock_llm_client):
    """Test extracting multiple places from a video."""
    # Mock response with multiple places
    mock_llm_client.invoke_structured = AsyncMock(
        return_value=LLMExtractionResult(
            places=[
                ExtractedPlace(
                    name="Le Bistro",
                    type=PlaceType.RESTAURANT,
                    description="French restaurant",
                    timestamp_seconds=120,
                    mentioned_context="Great food",
                ),
                ExtractedPlace(
                    name="Eiffel Tower",
                    type=PlaceType.ATTRACTION,
                    description="Iconic landmark",
                    timestamp_seconds=300,
                    mentioned_context="Must visit",
                ),
            ],
            suggested_title="Best of Paris",
            suggested_summary="Exploring top spots in Paris.",
        )
    )

    extraction = await extract_places_from_video(sample_video, mock_llm_client)
    places = extraction.places
    suggested_title = extraction.suggested_title
    suggested_summary = extraction.suggested_summary

    assert len(places) == 2
    assert places[0].name == "Le Bistro"
    assert places[1].name == "Eiffel Tower"
    assert places[0].type == PlaceType.RESTAURANT
    assert places[1].type == PlaceType.ATTRACTION
    assert suggested_title == "Best of Paris"
    assert suggested_summary == "Exploring top spots in Paris."


@pytest.mark.asyncio
async def test_extract_places_with_address_and_neighborhood(sample_video, mock_llm_client):
    """Test extracting places with address and neighborhood information."""
    # Mock response with place that has address and neighborhood
    mock_llm_client.invoke_structured = AsyncMock(
        return_value=LLMExtractionResult(
            places=[
                ExtractedPlace(
                    name="Le Bistro",
                    type=PlaceType.RESTAURANT,
                    description="Amazing French restaurant",
                    timestamp_seconds=120,
                    mentioned_context="The food was incredible",
                    address="123 Rue de la Paix, 75001 Paris",
                    neighborhood="Le Marais",
                ),
                ExtractedPlace(
                    name="Eiffel Tower",
                    type=PlaceType.ATTRACTION,
                    description="Iconic landmark",
                    timestamp_seconds=300,
                    mentioned_context="Must visit",
                    address=None,
                    neighborhood="7th Arrondissement",
                ),
                ExtractedPlace(
                    name="Hidden Cafe",
                    type=PlaceType.COFFEE_SHOP,
                    description="Cozy coffee spot",
                    timestamp_seconds=450,
                    mentioned_context="Best croissants",
                    address="45 Avenue des Champs-Élysées",
                    neighborhood=None,
                ),
                ExtractedPlace(
                    name="Museum of Art",
                    type=PlaceType.ATTRACTION,
                    description="Great art collection",
                    timestamp_seconds=600,
                    mentioned_context="Worth the visit",
                    address=None,
                    neighborhood=None,
                ),
            ],
            suggested_title="Paris Highlights",
            suggested_summary="Exploring Paris with detailed locations.",
        )
    )

    extraction = await extract_places_from_video(sample_video, mock_llm_client)
    places = extraction.places

    assert len(places) == 4

    # Test place with both address and neighborhood
    place_with_both = places[0]
    assert place_with_both.name == "Le Bistro"
    assert place_with_both.address == "123 Rue de la Paix, 75001 Paris"
    assert place_with_both.neighborhood == "Le Marais"

    # Test place with only neighborhood
    place_with_neighborhood = places[1]
    assert place_with_neighborhood.name == "Eiffel Tower"
    assert place_with_neighborhood.address is None
    assert place_with_neighborhood.neighborhood == "7th Arrondissement"

    # Test place with only address
    place_with_address = places[2]
    assert place_with_address.name == "Hidden Cafe"
    assert place_with_address.address == "45 Avenue des Champs-Élysées"
    assert place_with_address.neighborhood is None

    # Test place with neither
    place_with_none = places[3]
    assert place_with_none.name == "Museum of Art"
    assert place_with_none.address is None
    assert place_with_none.neighborhood is None
