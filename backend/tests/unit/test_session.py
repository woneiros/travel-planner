"""Tests for session management."""


import pytest

from app.models.place import Place, PlaceType
from app.models.video import Video
from app.services.session_manager import SessionManager
from app.utils.errors import InvalidSessionError


@pytest.fixture
def session_manager():
    """Create a session manager for testing."""
    return SessionManager()


@pytest.fixture
def sample_video():
    """Create a sample video for testing."""
    return Video(
        video_id="test123",
        title="Test Video",
        description="A test video",
        duration_seconds=600,
        transcript="This is a test transcript",
        url="https://youtube.com/watch?v=test123",
    )


@pytest.fixture
def sample_place():
    """Create a sample place for testing."""
    return Place(
        name="Test Restaurant",
        type=PlaceType.RESTAURANT,
        description="A great place to eat",
        video_id="test123",
        mentioned_context="The host loved this place",
    )


class TestSessionManager:
    """Tests for SessionManager class."""

    def test_create_session(self, session_manager):
        """Test creating a new session."""
        session = session_manager.create_session()

        assert session.session_id is not None
        assert len(session.videos) == 0
        assert len(session.places) == 0
        assert len(session.chat_history) == 0

    def test_get_session(self, session_manager):
        """Test retrieving an existing session."""
        session = session_manager.create_session()
        session_id = session.session_id

        retrieved_session = session_manager.get_session(session_id)

        assert retrieved_session.session_id == session_id

    def test_get_nonexistent_session_raises_error(self, session_manager):
        """Test that getting a non-existent session raises error."""
        with pytest.raises(InvalidSessionError):
            session_manager.get_session("nonexistent-id")

    def test_update_session(self, session_manager, sample_video, sample_place):
        """Test updating a session."""
        session = session_manager.create_session()

        session.videos.append(sample_video)
        session.places.append(sample_place)

        session_manager.update_session(session)

        retrieved_session = session_manager.get_session(session.session_id)

        assert len(retrieved_session.videos) == 1
        assert len(retrieved_session.places) == 1
        assert retrieved_session.videos[0].video_id == "test123"

    def test_delete_session(self, session_manager):
        """Test deleting a session."""
        session = session_manager.create_session()
        session_id = session.session_id

        session_manager.delete_session(session_id)

        with pytest.raises(InvalidSessionError):
            session_manager.get_session(session_id)

    def test_delete_nonexistent_session_raises_error(self, session_manager):
        """Test that deleting a non-existent session raises error."""
        with pytest.raises(InvalidSessionError):
            session_manager.delete_session("nonexistent-id")

    def test_get_session_count(self, session_manager):
        """Test getting the number of active sessions."""
        assert session_manager.get_session_count() == 0

        session_manager.create_session()
        assert session_manager.get_session_count() == 1

        session_manager.create_session()
        assert session_manager.get_session_count() == 2
