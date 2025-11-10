"""In-memory session management with TTL."""

import asyncio
from datetime import datetime, timedelta
from typing import Optional

from app.config import settings
from app.models.session import Session
from app.utils.errors import InvalidSessionError
from app.utils.logger import setup_logger

logger = setup_logger(__name__)


class SessionManager:
    """Manages user sessions in memory with TTL."""

    def __init__(self):
        """Initialize session manager with empty storage."""
        self._sessions: dict[str, Session] = {}
        self._cleanup_task: Optional[asyncio.Task] = None

    async def start(self):
        """Start background cleanup task."""
        if self._cleanup_task is None:
            self._cleanup_task = asyncio.create_task(self._cleanup_expired_sessions())
            logger.info("Session manager started with cleanup task")

    async def stop(self):
        """Stop background cleanup task."""
        if self._cleanup_task:
            self._cleanup_task.cancel()
            try:
                await self._cleanup_task
            except asyncio.CancelledError:
                pass
            self._cleanup_task = None
            logger.info("Session manager stopped")

    async def _cleanup_expired_sessions(self):
        """Background task to clean up expired sessions."""
        while True:
            try:
                await asyncio.sleep(300)  # Run every 5 minutes

                now = datetime.utcnow()
                ttl_delta = timedelta(seconds=settings.session_ttl_seconds)
                expired_ids = []

                for session_id, session in self._sessions.items():
                    if now - session.last_activity > ttl_delta:
                        expired_ids.append(session_id)

                for session_id in expired_ids:
                    del self._sessions[session_id]
                    logger.info(f"Cleaned up expired session: {session_id}")

                if expired_ids:
                    logger.info(f"Cleaned up {len(expired_ids)} expired sessions")

            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in session cleanup task: {str(e)}")

    def create_session(self) -> Session:
        """
        Create a new session.

        Returns:
            New Session object
        """
        session = Session()
        self._sessions[session.session_id] = session
        logger.info(f"Created new session: {session.session_id}")
        return session

    def get_session(self, session_id: str) -> Session:
        """
        Retrieve a session by ID.

        Args:
            session_id: Session ID to retrieve

        Returns:
            Session object

        Raises:
            InvalidSessionError: If session doesn't exist or is expired
        """
        session = self._sessions.get(session_id)

        if not session:
            raise InvalidSessionError(f"Session not found: {session_id}")

        # Check if expired
        now = datetime.utcnow()
        ttl_delta = timedelta(seconds=settings.session_ttl_seconds)

        if now - session.last_activity > ttl_delta:
            del self._sessions[session_id]
            raise InvalidSessionError(f"Session expired: {session_id}")

        return session

    def get_or_create_session(self, session_id: Optional[str]) -> Session:
        """
        Retrieve a session by ID, or create a new one if not found.

        Args:
            session_id: Session ID to retrieve

        Returns:
            Session object
        """
        if not session_id:
            return self.create_session()
        session = self._sessions.get(session_id, None)
        if not session:
            return self.create_session()
        return session

    def update_session(self, session: Session) -> None:
        """
        Update a session and refresh its activity timestamp.

        Args:
            session: Session to update
        """
        session.last_activity = datetime.utcnow()
        self._sessions[session.session_id] = session
        logger.debug(f"Updated session: {session.session_id}")

    def delete_session(self, session_id: str) -> None:
        """
        Delete a session.

        Args:
            session_id: Session ID to delete

        Raises:
            InvalidSessionError: If session doesn't exist
        """
        if session_id not in self._sessions:
            raise InvalidSessionError(f"Session not found: {session_id}")

        del self._sessions[session_id]
        logger.info(f"Deleted session: {session_id}")

    def get_session_count(self) -> int:
        """Get the number of active sessions."""
        return len(self._sessions)


# Global session manager instance
session_manager = SessionManager()


def get_session_manager() -> SessionManager:
    """Get the global session manager instance."""
    return session_manager
