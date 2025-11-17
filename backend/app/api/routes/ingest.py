"""Video ingestion endpoints."""

import time
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator

from app.agents.extraction import extract_places_from_video
from app.api.auth import CurrentUser
from app.models.place import Place
from app.models.video import Video
from app.observability.langfuse_client import observe, propagate_attributes
from app.services.llm_client import create_llm_client
from app.services.session_manager import get_session_manager
from app.services.youtube import process_video
from app.utils.logger import setup_logger

logger = setup_logger(__name__)
router = APIRouter()

LLM_PROVIDER = "anthropic"


class IngestRequest(BaseModel):
    """Request model for video ingestion."""

    video_urls: list[str] = Field(
        ..., min_length=1, max_length=10, description="1-10 YouTube URLs"
    )
    session_id: Optional[str] = Field(
        default=None, description="Session ID from ingestion"
    )

    @field_validator("video_urls")
    @classmethod
    def validate_urls(cls, urls: list[str]) -> list[str]:
        """Validate that URLs are non-empty strings."""
        for url in urls:
            if not url.strip():
                raise ValueError("URLs cannot be empty")
        return urls


class IngestResponse(BaseModel):
    """Response model for video ingestion."""

    session_id: str
    videos: list[Video]
    total_places: int
    processing_time_ms: int


@router.post("/ingest", response_model=IngestResponse)
@observe()
async def ingest_videos(request: IngestRequest, current_user: CurrentUser):
    """
    Ingest YouTube videos and extract places.

    Requires authentication via Clerk JWT token in Authorization header.

    Process:
    1. Validate YouTube URLs
    2. Fetch transcripts for each video
    3. Extract structured place data using LLM
    4. Generate video summaries
    5. Store in session

    Args:
        request: IngestRequest with video URLs and LLM provider
        current_user: Authenticated user from Clerk JWT

    Returns:
        IngestResponse with session ID, video summaries, and place count

    Raises:
        HTTPException: If processing fails or unauthorized
    """
    # with tracer.start_as_current_span("ingest_videos") as span:
    #     span.set_attribute("video.count", len(request.video_urls))
    #     span.set_attribute("llm.provider", request.llm_provider)
    #     span.set_attribute("user.id", current_user["user_id"])
    #     if current_user.get("email"):
    #         span.set_attribute("user.email", current_user["email"])

    start_time = time.time()

    try:
        # Create LLM client
        llm_client = create_llm_client(LLM_PROVIDER)
        logger.info(
            f"User {current_user['user_id']} starting ingestion of "
            f"{len(request.video_urls)} videos using {LLM_PROVIDER}"
        )
        propagate_attributes(
            user_id=current_user["user_id"],
            metadata={"llm_provider": LLM_PROVIDER, "pipeline": "video_ingestion"},
        )

        # Create new session
        session_manager = get_session_manager()
        session = session_manager.get_or_create_session(request.session_id)

        all_places: list[Place] = []
        success_videos: list[Video] = []
        error_videos: list[str] = []

        # Process each video
        for idx, url in enumerate(request.video_urls):
            logger.info(f"Processing video {idx + 1}/{len(request.video_urls)}: {url}")

            try:
                # Fetch transcript and metadata
                video = await process_video(url)
                session.videos.append(video)

                # Extract places and get suggested title
                extracted_result = await extract_places_from_video(video, llm_client)
                all_places.extend(extracted_result.places)
                session.places.extend(extracted_result.places)
                # Use suggested title from LLM instead of placeholder
                video.title = extracted_result.suggested_title
                video.summary = extracted_result.suggested_summary
                video.places_count = len(extracted_result.places)

                success_videos.append(video)
                logger.info(
                    f"Completed video {video.video_id}: "
                    f"{len(extracted_result.places)} places extracted"
                )

            except Exception as e:
                error_msg = f"Failed to process video {url}: {str(e)}"
                logger.error(error_msg)
                error_videos.append(url)
                # Continue with other videos instead of failing completely
                # In production, you might want to track partial failures
                continue

        # Update session
        session_manager.update_session(session)

        # Calculate processing time
        processing_time_ms = int((time.time() - start_time) * 1000)
        # span.set_attribute("places.total", len(all_places))
        # span.set_attribute("processing_time_ms", processing_time_ms)

        logger.info(
            f"Ingestion complete: {len(success_videos)} videos, "
            f"{len(all_places)} places, {processing_time_ms}ms"
        )

        return IngestResponse(
            session_id=session.session_id,
            videos=success_videos,
            total_places=len(all_places),
            processing_time_ms=processing_time_ms,
        )

    except Exception as e:
        error_msg = f"Video ingestion failed: {str(e)}"
        logger.error(error_msg)
        raise HTTPException(status_code=500, detail=error_msg) from e
