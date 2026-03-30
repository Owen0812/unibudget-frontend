# app/routers/auth.py
# OAuth 2.0 Mock Endpoints. Ready for future JWT integration.

from fastapi import APIRouter

router = APIRouter()

@router.get("/google")
def login_google():
    """Redirect to Google OAuth consent screen (pending credentials)."""
    return {"status": "pending", "message": "Google OAuth configuration pending."}

@router.get("/github")
def login_github():
    """Redirect to GitHub OAuth consent screen (pending credentials)."""
    return {"status": "pending", "message": "GitHub OAuth configuration pending."}

@router.post("/logout")
def logout():
    """
    Invalidate session token.
    In production: blacklist JWT or clear session cookie.
    """
    return {"status": "success", "message": "Logged out successfully"}