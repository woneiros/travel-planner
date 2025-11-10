"""Chat interaction endpoints."""

from typing import Literal, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.api.auth import CurrentUser
from app.models.chat import ChatMessage
from app.models.session import Session
from app.observability.langfuse_client import observe
from app.services.chat_agent import chat_with_agent
from app.services.llm_client import create_llm_client
from app.services.session_manager import get_session_manager
from app.utils.errors import InvalidSessionError
from app.utils.logger import setup_logger

logger = setup_logger(__name__)
router = APIRouter()


class ChatRequest(BaseModel):
    """Request model for chat interaction."""

    session_id: Optional[str] = Field(
        default=None, description="Session ID from ingestion"
    )
    message: str = Field(..., min_length=1, max_length=1000, description="User message")
    llm_provider: Literal["openai", "anthropic"] = Field(
        ..., description="LLM provider to use"
    )


class ChatSource(BaseModel):
    """Source reference for chat response."""

    video_id: str
    title: str
    timestamp: int | None = None


class ChatResponse(BaseModel):
    """Response model for chat interaction."""

    message: str
    places_referenced: list[str]
    sources: list[ChatSource]


@router.post("/chat", response_model=ChatResponse)
@observe()
async def chat(request: ChatRequest, current_user: CurrentUser):
    """
    Chat with the AI agent about extracted places.

    Requires authentication via Clerk JWT token in Authorization header.

    Process:
    1. Retrieve session with places and chat history
    2. Use chat agent with tools to generate response
    3. Update chat history in session
    4. Return response with referenced places and sources

    Args:
        request: ChatRequest with session ID, message, and LLM provider
        current_user: Authenticated user from Clerk JWT

    Returns:
        ChatResponse with agent message, referenced places, and sources

    Raises:
        HTTPException: If chat fails, session is invalid, or unauthorized
    """
    # with tracer.start_as_current_span("chat_interaction") as span:
    #     span.set_attribute("session.id", request.session_id)
    #     span.set_attribute("user.query", request.message)
    #     span.set_attribute("llm.provider", request.llm_provider)
    #     span.set_attribute("user.id", current_user["user_id"])
    #     if current_user.get("email"):
    #         span.set_attribute("user.email", current_user["email"])

    try:
        # Get session
        session_manager = get_session_manager()
        session = session_manager.get_or_create_session(request.session_id)

        # Create LLM client
        llm_client = create_llm_client(request.llm_provider)

        logger.info(
            f"User {current_user['user_id']} processing chat for session {request.session_id}"
        )

        # Chat with agent
        response_text, referenced_place_ids = await chat_with_agent(
            session, request.message, llm_client
        )

        # Add messages to chat history
        user_msg = ChatMessage(
            role="user", content=request.message, places_referenced=[]
        )
        assistant_msg = ChatMessage(
            role="assistant",
            content=response_text,
            places_referenced=referenced_place_ids,
        )

        session.chat_history.append(user_msg)
        session.chat_history.append(assistant_msg)

        # Update session
        session_manager.update_session(session)

        # Build sources from referenced places
        sources = []
        for place_id in referenced_place_ids[:5]:  # Limit to 5 sources
            place = next((p for p in session.places if p.id == place_id), None)
            if place:
                video = next(
                    (v for v in session.videos if v.video_id == place.video_id), None
                )
                if video:
                    sources.append(
                        ChatSource(
                            video_id=video.video_id,
                            title=video.title,
                            timestamp=place.timestamp_seconds,
                        )
                    )

        # span.set_attribute("places.referenced", len(referenced_place_ids))
        logger.info(f"Chat complete with {len(referenced_place_ids)} places referenced")

        return ChatResponse(
            message=response_text,
            places_referenced=referenced_place_ids,
            sources=sources,
        )

    except InvalidSessionError as e:
        logger.error(f"Invalid session: {str(e)}")
        raise HTTPException(status_code=404, detail=str(e)) from e

    except Exception as e:
        error_msg = f"Chat failed: {str(e)}"
        logger.error(error_msg)
        raise HTTPException(status_code=500, detail=error_msg) from e


@router.get("/session/{session_id}", response_model=Session)
async def get_session(session_id: str, current_user: CurrentUser):
    """
    Retrieve session data by ID.

    Requires authentication via Clerk JWT token in Authorization header.

    Args:
        session_id: Session ID to retrieve
        current_user: Authenticated user from Clerk JWT

    Returns:
        Complete Session object with videos, places, and chat history

    Raises:
        HTTPException: If session not found, expired, or unauthorized
    """
    try:
        session_manager = get_session_manager()
        session = session_manager.get_session(session_id)
        logger.info(f"User {current_user['user_id']} retrieved session {session_id}")
        return session

    except InvalidSessionError as e:
        logger.error(f"Invalid session: {str(e)}")
        raise HTTPException(status_code=404, detail=str(e)) from e


@router.delete("/session/{session_id}")
async def delete_session(session_id: str, current_user: CurrentUser):
    """
    Delete a session by ID.

    Requires authentication via Clerk JWT token in Authorization header.

    Args:
        session_id: Session ID to delete
        current_user: Authenticated user from Clerk JWT

    Returns:
        Success message

    Raises:
        HTTPException: If session not found or unauthorized
    """
    try:
        session_manager = get_session_manager()
        session_manager.delete_session(session_id)
        logger.info(f"User {current_user['user_id']} deleted session {session_id}")
        return {"message": f"Session {session_id} deleted successfully"}

    except InvalidSessionError as e:
        logger.error(f"Invalid session: {str(e)}")
        raise HTTPException(status_code=404, detail=str(e)) from e
