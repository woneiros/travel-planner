"""Intercom Identity Verification endpoint."""

from datetime import datetime, timedelta

import jwt
from fastapi import APIRouter, HTTPException, status

from app.api.auth import CurrentUser
from app.config import settings
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

router = APIRouter()


@router.get("/intercom/user-hash")
async def get_intercom_user_hash(current_user: CurrentUser) -> dict:
    """
    Generate Intercom Identity Verification JWT for the authenticated user.

    This endpoint generates a JWT token containing the user's information,
    signed with the Intercom Identity Verification secret. This token is used
    to securely verify the user's identity in Intercom and can include
    protected attributes that shouldn't be modifiable client-side.

    Args:
        current_user: Authenticated user from Clerk JWT

    Returns:
        dict: Contains the user_hash (JWT) for Intercom Identity Verification
            {
                "user_hash": str,  # The JWT token
                "user_id": str
            }

    Raises:
        HTTPException: 500 if Intercom secret is not configured
    """
    if not settings.intercom_identity_verification_secret:
        logger.error("Intercom Identity Verification secret not configured")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Intercom Identity Verification is not configured",
        )

    try:
        user_id = current_user["user_id"]
        email = current_user["email"]

        # Token expires in 1 hour
        expires_at = int((datetime.now() + timedelta(hours=1)).timestamp())

        # Build JWT payload
        payload = {
            "user_id": user_id,
            "exp": expires_at,
        }

        # Add email if available
        if email:
            payload["email"] = email

        # Add name if available
        first_name = current_user.get("first_name")
        last_name = current_user.get("last_name")
        if first_name or last_name:
            name_parts = [first_name, last_name]
            payload["name"] = " ".join(filter(None, name_parts))

        # Future: Add any protected/sensitive attributes here
        # payload["subscription_tier"] = user.subscription_tier
        # payload["account_balance"] = user.account_balance

        # Generate JWT
        user_hash = jwt.encode(
            payload,
            settings.intercom_identity_verification_secret,
            algorithm="HS256",
        )

        logger.info(f"Generated Intercom JWT for user: {user_id}")

        return {"user_hash": user_hash, "user_id": user_id}

    except Exception as e:
        logger.error(f"Failed to generate Intercom JWT: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate Intercom user hash",
        ) from e
