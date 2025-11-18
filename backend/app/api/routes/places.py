"""Place preference endpoints."""

from typing import Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.api.auth import CurrentUser
from app.services.session_manager import get_session_manager
from app.utils.errors import InvalidSessionError
from app.utils.logger import setup_logger

logger = setup_logger(__name__)
router = APIRouter()


class UpdatePlacePreferenceRequest(BaseModel):
    """Request model for updating place preference."""

    session_id: str = Field(..., description="Session ID")
    place_id: str = Field(..., description="Place ID")
    preference: Literal["interested", "not_interested", "neutral"] = Field(
        ..., description="User preference"
    )


@router.put("/places/preference")
async def update_place_preference(
    request: UpdatePlacePreferenceRequest,
    current_user: CurrentUser
):
    """
    Update user preference for a place.

    Args:
        request: UpdatePlacePreferenceRequest with session_id, place_id, and preference
        current_user: Authenticated user from Clerk JWT

    Returns:
        Updated Place object

    Raises:
        HTTPException: If session or place not found
    """
    try:
        session_manager = get_session_manager()
        session = session_manager.get_session(request.session_id)

        # Find the place
        place = next((p for p in session.places if p.id == request.place_id), None)
        if not place:
            raise HTTPException(status_code=404, detail="Place not found")

        # Update preference (mutually exclusive)
        if request.preference == "interested":
            place.is_interested = True
            place.is_not_interested = False
        elif request.preference == "not_interested":
            place.is_interested = False
            place.is_not_interested = True
        else:  # neutral
            place.is_interested = False
            place.is_not_interested = False

        # Update session
        session_manager.update_session(session)

        logger.info(
            f"Updated preference for place {request.place_id} to {request.preference}"
        )

        return place

    except InvalidSessionError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to update place preference: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) from e

