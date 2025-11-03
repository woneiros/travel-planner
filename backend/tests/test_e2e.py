"""
End-to-end tests for the travel planner application.

These tests verify the complete flow without mocks, testing real API integrations.
Langfuse logging/tracing is disabled to avoid polluting test output.

TEST 1 (YouTube transcript extraction):
    - Runs by default locally
    - Skipped in CI (YouTube blocks CI runner IPs)

TEST 2 (LLM place extraction):
    - Skipped by default everywhere to prevent accidental API costs
    - Requires explicit opt-in with RUN_LLM_TESTS=true

To run locally (TEST 1 runs, TEST 2 skipped):
    pytest tests/test_e2e.py -v

To run all tests including LLM test:
    RUN_LLM_TESTS=true pytest tests/test_e2e.py -v

To run only the LLM test:
    RUN_LLM_TESTS=true pytest tests/test_e2e.py::test_place_extraction_from_transcript_e2e -v
"""

import os
from datetime import datetime

import pytest

from app.models.place import Place, PlaceType
from app.models.video import Video
from app.services.extraction import extract_places_from_video
from app.services.llm_client import create_llm_client
from app.services.youtube import extract_video_id, fetch_transcript


@pytest.fixture(autouse=True)
def disable_langfuse(monkeypatch):
    """Disable Langfuse logging and tracing for all tests."""
    monkeypatch.setenv("LANGFUSE_PUBLIC_KEY", "")
    monkeypatch.setenv("LANGFUSE_SECRET_KEY", "")


# TEST 1: Given a YouTube URL, extract the transcript correctly
@pytest.mark.asyncio
@pytest.mark.skipif(
    os.getenv("CI") == "true",
    reason="Skipped in CI due to YouTube IP blocks. Runs by default locally.",
)
async def test_youtube_transcript_extraction_e2e():
    """
    E2E test: Extract transcript from a real YouTube URL.

    This test verifies the complete YouTube transcript extraction flow:
    1. Extract video ID from URL
    2. Fetch transcript using YouTube API
    3. Verify transcript is returned correctly

    No mocks are used - this tests the real YouTube API integration.
    Skipped in CI environments due to YouTube blocking CI runner IPs.
    """
    # Arrange
    url = "https://www.youtube.com/watch?v=549amskpMdc"
    expected_video_id = "549amskpMdc"

    # Act
    video_id = extract_video_id(url)
    transcript = await fetch_transcript(video_id)

    # Assert
    assert video_id == expected_video_id, f"Expected video ID {expected_video_id}, got {video_id}"
    assert isinstance(transcript, str), "Transcript should be a string"
    assert len(transcript) > 0, "Transcript should not be empty"
    assert len(transcript) > 100, "Transcript should have substantial content"

    print(f"\n✓ Successfully extracted transcript ({len(transcript)} characters)")
    print(f"✓ Video ID: {video_id}")
    print(f"✓ Transcript preview: {transcript[:100]}...")


# TEST 2: Given a transcript, obtain places from the transcript.
# Here rather than testing the LLM output, we test the result is correct.
# This test is skipped by default to avoid accidental API costs.
@pytest.mark.asyncio
@pytest.mark.skipif(
    os.getenv("RUN_LLM_TESTS") != "true",
    reason="Skipped by default to avoid API costs. "
    "Run with: RUN_LLM_TESTS=true pytest tests/test_e2e.py",
)
async def test_place_extraction_from_transcript_e2e():
    """
    E2E test: Extract places from a transcript using real LLM.

    This test verifies the complete place extraction flow:
    1. Create a Video object with a sample transcript containing place mentions
    2. Use real LLM (Anthropic Claude) to extract places
    3. Verify the structure and validity of extracted places

    Requirements:
    - ANTHROPIC_API_KEY must be set in environment
    - RUN_LLM_TESTS=true must be set to enable this test

    To run this test:
        RUN_LLM_TESTS=true pytest tests/test_e2e.py::test_place_extraction_from_transcript_e2e -v

    Note: This tests result correctness, not specific LLM output.
    Skipped by default to prevent accidental API costs.
    """
    # Arrange - Sample transcript with clear place mentions
    sample_transcript = """
    Today I'm going to share my favorite spots in Tokyo!

    First up is Ichiran Ramen in Shibuya - this place has the most amazing tonkotsu
    broth you'll ever taste. You order using a vending machine and eat in individual
    booths for a unique experience.

    Next, we visited the Senso-ji Temple in Asakusa. This is Tokyo's oldest temple
    and the atmosphere is just incredible. Make sure to explore Nakamise Shopping Street
    on your way to the temple - it's packed with traditional snacks and souvenirs.

    For coffee lovers, you have to check out Blue Bottle Coffee in Omotesando.
    Their pour-over coffee is exceptional, and the minimalist interior is perfect
    for working or relaxing.

    Finally, we went to teamLab Borderless, an incredible digital art museum in Odaiba.
    The immersive installations are mind-blowing - you could easily spend 3-4 hours here.
    """

    video = Video(
        video_id="test_e2e_123",
        title="Tokyo Travel Guide",
        description="Best places to visit in Tokyo",
        duration_seconds=600,
        transcript=sample_transcript,
        url="https://youtube.com/watch?v=test_e2e_123",
    )

    # Act - Use real LLM client
    llm_client = create_llm_client("anthropic")
    places, suggested_title = await extract_places_from_video(video, llm_client)

    # Assert - Test result structure and validity
    assert isinstance(places, list), "Places should be a list"
    assert len(places) > 0, "Should extract at least one place from the transcript"
    assert isinstance(suggested_title, str), "Suggested title should be a string"
    assert len(suggested_title) > 0, "Suggested title should not be empty"

    print(f"\n✓ Extracted {len(places)} places")
    print(f"✓ Suggested title: '{suggested_title}'")

    # Verify each place has the correct structure
    for i, place in enumerate(places, 1):
        assert isinstance(place, Place), f"Place {i} should be a Place object"
        assert isinstance(place.id, str), f"Place {i} should have a string ID"
        assert len(place.id) > 0, f"Place {i} ID should not be empty"
        assert isinstance(place.name, str), f"Place {i} should have a string name"
        assert len(place.name) > 0, f"Place {i} name should not be empty"
        assert place.type in PlaceType, f"Place {i} type should be a valid PlaceType"
        assert isinstance(place.description, str), f"Place {i} should have a string description"
        assert place.video_id == video.video_id, f"Place {i} should reference correct video_id"
        assert isinstance(place.mentioned_context, str), f"Place {i} should have mentioned_context"
        assert isinstance(place.created_at, datetime), f"Place {i} should have a datetime"

        print(f"  {i}. {place.name} ({place.type.value})")
        print(f"     Description: {place.description[:80]}...")

    # Verify we got reasonable results (spot check)
    place_types = [p.type for p in places]

    # Should have identified at least some expected place types
    assert any(pt in [PlaceType.RESTAURANT, PlaceType.COFFEE_SHOP] for pt in place_types), \
        "Should identify at least one restaurant or coffee shop"

    print("\n✓ All place objects have valid structure")
    print(f"✓ Place types found: {set(pt.value for pt in place_types)}")
