"""Clerk authentication for FastAPI."""

from typing import Annotated

import httpx
from clerk_backend_api import Clerk
from clerk_backend_api.security.types import AuthenticateRequestOptions
from fastapi import Depends, HTTPException, Request, status

from app.config import settings
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

# Initialize Clerk client
clerk_client = Clerk(bearer_auth=settings.clerk_secret_key)


async def get_current_user(request: Request) -> dict:
    """
    Verify Clerk JWT token and return user information.

    This dependency uses Clerk's authenticate_request method to verify the JWT token
    and returns user information.

    Args:
        request: FastAPI request object

    Returns:
        dict: User information from Clerk JWT
            {
                "user_id": str,
                "email": str,
                "first_name": str | None,
                "last_name": str | None
            }

    Raises:
        HTTPException: 401 if token is invalid or missing
    """
    try:
        # Convert FastAPI request to httpx.Request for Clerk SDK
        httpx_request = httpx.Request(
            method=request.method,
            url=str(request.url),
            headers=request.headers.raw,
        )

        # Authenticate the request using Clerk's SDK
        request_state = clerk_client.authenticate_request(
            httpx_request,
            AuthenticateRequestOptions(
                authorized_parties=None,  # Optional: limit to specific domains
            ),
        )

        # Check if the request is authenticated
        if not request_state.is_signed_in:
            logger.warning(f"Token verification failed: {request_state.reason}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Extract user ID from the verified token payload
        user_id = request_state.payload.get("sub")
        if not user_id:
            logger.error("Missing user ID in verified token")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Get additional user info from Clerk API
        try:
            user = clerk_client.users.get(user_id=user_id)
            if not user:
                raise ValueError("User not found in Clerk")
            user_info = {
                "user_id": user_id,
                "email": (
                    user.email_addresses[0].email_address
                    if user.email_addresses and user.email_addresses[0]
                    else None
                ),
                "first_name": user.first_name,
                "last_name": user.last_name,
            }
        except Exception as e:
            payload = request_state.payload
            if payload is None:
                payload = {}
            # If we can't fetch user details, use basic info from token
            logger.warning(f"Could not fetch user details from Clerk: {e}")
            user_info = {
                "user_id": user_id,
                "email": payload.get("email", None),
                "first_name": None,
                "last_name": None,
            }

        logger.info(f"Authenticated user: {user_info['user_id']}")
        return user_info

    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise

    except Exception as e:
        logger.error(f"Authentication failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed",
            headers={"WWW-Authenticate": "Bearer"},
        ) from e


# Type alias for dependency injection
CurrentUser = Annotated[dict, Depends(get_current_user)]
