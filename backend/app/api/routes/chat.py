"""Chat interaction endpoints."""

from fastapi import APIRouter

router = APIRouter()


@router.post("/chat")
async def chat():
    """
    Chat with the AI agent about extracted places.

    Uses session context to answer questions about travel recommendations.
    """
    # TODO: Implement chat endpoint
    return {"message": "Chat endpoint - to be implemented"}


@router.get("/session/{session_id}")
async def get_session(session_id: str):
    """Retrieve session data by ID."""
    # TODO: Implement session retrieval
    return {"message": f"Get session {session_id} - to be implemented"}


@router.delete("/session/{session_id}")
async def delete_session(session_id: str):
    """Delete a session by ID."""
    # TODO: Implement session deletion
    return {"message": f"Delete session {session_id} - to be implemented"}
