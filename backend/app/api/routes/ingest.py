"""Video ingestion endpoints."""

import time
from typing import Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator

from app.api.auth import CurrentUser
from app.models.video import VideoSummary
from app.observability.langfuse_client import observe
from app.observability.tracing import tracer
from app.services.extraction import extract_places_from_video, generate_video_summary
from app.services.llm_client import create_llm_client
from app.services.session_manager import get_session_manager
from app.services.youtube import process_video
from app.utils.logger import setup_logger

logger = setup_logger(__name__)
router = APIRouter()


class IngestRequest(BaseModel):
    """Request model for video ingestion."""

    video_urls: list[str] = Field(
        ..., min_length=1, max_length=10, description="1-10 YouTube URLs"
    )
    llm_provider: Literal["openai", "anthropic"] = Field(
        ..., description="LLM provider to use"
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
    videos: list[VideoSummary]
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
        llm_client = create_llm_client(request.llm_provider)
        logger.info(
            f"User {current_user['user_id']} starting ingestion of "
            f"{len(request.video_urls)} videos using {request.llm_provider}"
        )

        # Create new session
        session_manager = get_session_manager()
        session = session_manager.create_session()

        video_summaries = []
        all_places = []

        # Process each video
        for idx, url in enumerate(request.video_urls):
            logger.info(f"Processing video {idx + 1}/{len(request.video_urls)}: {url}")

            try:
                # Fetch transcript and metadata
                video = await process_video(url)
                session.videos.append(video)

                # Extract places and get suggested title
                places, suggested_title = await extract_places_from_video(
                    video, llm_client
                )
                all_places.extend(places)
                session.places.extend(places)

                # Use suggested title from LLM instead of placeholder
                video.title = suggested_title

                # Generate summary
                summary = await generate_video_summary(video, places, llm_client)

                # Create video summary
                video_summary = VideoSummary(
                    video_id=video.video_id,
                    title=suggested_title,
                    summary=summary,
                    places_count=len(places),
                )
                video_summaries.append(video_summary)

                logger.info(
                    f"Completed video {video.video_id}: "
                    f"{len(places)} places extracted"
                )

            except Exception as e:
                error_msg = f"Failed to process video {url}: {str(e)}"
                logger.error(error_msg)
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
            f"Ingestion complete: {len(video_summaries)} videos, "
            f"{len(all_places)} places, {processing_time_ms}ms"
        )

        return IngestResponse(
            session_id=session.session_id,
            videos=video_summaries,
            total_places=len(all_places),
            processing_time_ms=processing_time_ms,
        )

    except Exception as e:
        error_msg = f"Video ingestion failed: {str(e)}"
        logger.error(error_msg)
        raise HTTPException(status_code=500, detail=error_msg) from e
