"""Place extraction service using LLM."""

from pydantic import BaseModel, Field

from app.models.place import Place, PlaceType
from app.models.video import Video
from app.observability.langfuse_client import observe
from app.observability.tracing import tracer
from app.services.llm_client import LLMClient
from app.utils.errors import ExtractionError
from app.utils.logger import setup_logger

logger = setup_logger(__name__)


# Structured output schema for place extraction
class ExtractedPlace(BaseModel):
    """Schema for a single extracted place."""

    name: str = Field(description="Name of the place as mentioned in the video")
    type: PlaceType = Field(description="Type of place: restaurant, attraction, hotel, activity, coffee_shop, shopping, or other")
    description: str = Field(description="Brief description of the place")
    timestamp_seconds: int | None = Field(
        default=None, description="Approximate timestamp in seconds where mentioned"
    )
    mentioned_context: str = Field(
        description="What the creator said about it (their opinion/recommendation)"
    )


class PlaceExtractionResult(BaseModel):
    """Schema for extraction result containing multiple places."""

    places: list[ExtractedPlace] = Field(description="List of extracted places")
    suggested_title: str = Field(
        description="A short, human-readable 3-5 word title for this video based on its content"
    )


EXTRACTION_SYSTEM_PROMPT = """You are an expert at analyzing travel video transcripts and extracting place recommendations.

Your task is to:
1. Create a short, catchy 3-5 word title for this video based on its content (e.g., "Tokyo Street Food Guide" or "Hidden Cafes in Paris")
2. Identify all places mentioned in the transcript that have recommendations or opinions from the creator

For each place, extract:
1. The exact name as mentioned
2. The type - MUST be one of these exact values:
   - "restaurant" for restaurants, bars, food spots
   - "attraction" for tourist sites, landmarks, museums
   - "hotel" for hotels, hostels, accommodations
   - "activity" for tours, activities, experiences
   - "coffee_shop" for cafes, coffee shops, bakeries (use "coffee_shop" not "cafe")
   - "shopping" for shops, markets, malls
   - "other" for anything else
3. A brief description (1-2 sentences)
4. What the creator said about it (their opinion, why they recommend it)
5. Approximate timestamp if determinable from context (optional)

IMPORTANT: Use exactly these category names. For cafes or coffee places, use "coffee_shop" not "cafe".

Only include places that the creator actually recommends or has an opinion about.
Skip places that are just mentioned in passing without any recommendation.

Be thorough but accurate. If unsure about a place's details, it's better to skip it."""


SUMMARY_SYSTEM_PROMPT = """You are an expert at summarizing travel video content.

Create a concise 2-3 sentence summary of the video that highlights:
1. The location/destination featured
2. The main types of recommendations (restaurants, hotels, activities, etc.)
3. The overall vibe or theme of the recommendations

Be engaging and informative."""


@observe()
async def extract_places_from_video(
    video: Video, llm_client: LLMClient
) -> tuple[list[Place], str]:
    """
    Extract places from a video transcript using LLM.

    Args:
        video: Video object with transcript
        llm_client: Configured LLM client

    Returns:
        Tuple of (list of extracted Place objects, suggested video title)

    Raises:
        ExtractionError: If extraction fails
    """
    with tracer.start_as_current_span("extract_places") as span:
        span.set_attribute("video.id", video.video_id)
        span.set_attribute("transcript.length", len(video.transcript))
        span.set_attribute("llm.provider", llm_client.provider)

        try:
            # Build user prompt with video context
            user_prompt = f"""Video Title: {video.title}
Description: {video.description or "N/A"}

Transcript:
{video.transcript}

Extract all recommended places from this travel video transcript."""

            messages = [
                {"role": "system", "content": EXTRACTION_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ]

            # Use structured output to get places and suggested title
            result = await llm_client.invoke_structured(messages, PlaceExtractionResult)

            # Get suggested title
            suggested_title = result.get("suggested_title", f"Video {video.video_id}")

            # Convert to Place models with video_id
            places = [
                Place(
                    name=p["name"],
                    type=p["type"],
                    description=p["description"],
                    video_id=video.video_id,
                    timestamp_seconds=p.get("timestamp_seconds"),
                    mentioned_context=p["mentioned_context"],
                )
                for p in result["places"]
            ]

            span.set_attribute("places.extracted", len(places))
            span.set_attribute("suggested_title", suggested_title)
            logger.info(
                f"Extracted {len(places)} places from video {video.video_id}, "
                f"suggested title: {suggested_title}"
            )

            return places, suggested_title

        except Exception as e:
            error_msg = f"Failed to extract places from video {video.video_id}: {str(e)}"
            logger.error(error_msg)
            raise ExtractionError(error_msg) from e


@observe()
async def generate_video_summary(
    video: Video, places: list[Place], llm_client: LLMClient
) -> str:
    """
    Generate a summary of the video based on transcript and extracted places.

    Args:
        video: Video object
        places: List of extracted places
        llm_client: Configured LLM client

    Returns:
        Summary text

    Raises:
        ExtractionError: If summary generation fails
    """
    with tracer.start_as_current_span("generate_summary") as span:
        span.set_attribute("video.id", video.video_id)
        span.set_attribute("places.count", len(places))

        try:
            # Build context about places
            places_context = "\n".join(
                [
                    f"- {p.name} ({p.type}): {p.mentioned_context}"
                    for p in places[:10]  # Limit to first 10 for context
                ]
            )

            user_prompt = f"""Video Title: {video.title}

Extracted Places:
{places_context}

Create a concise summary of this travel video."""

            messages = [
                {"role": "system", "content": SUMMARY_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ]

            summary = await llm_client.invoke(messages)

            logger.info(f"Generated summary for video {video.video_id}")
            return summary.strip()

        except Exception as e:
            error_msg = f"Failed to generate summary for video {video.video_id}: {str(e)}"
            logger.error(error_msg)
            raise ExtractionError(error_msg) from e
