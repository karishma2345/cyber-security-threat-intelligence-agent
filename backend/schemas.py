from datetime import datetime
from typing import Optional, List, Any

from pydantic import BaseModel, EmailStr, Field


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------
class UserSignup(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    full_name: Optional[str] = ""
    password: str = Field(min_length=6)


class UserLogin(BaseModel):
    username: str
    password: str


class AdminLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    username: str


class UserOut(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str] = ""
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Threats
# ---------------------------------------------------------------------------
class ThreatOut(BaseModel):
    id: int
    source: str
    article_title: str
    url: str
    published: str
    content: str
    threat_type: str
    severity: str
    mitre: str
    ip_count: int
    domain_count: int
    url_count: int
    cve_count: int
    email_count: int
    sha256_count: int
    md5_count: int
    ips: Any
    domains: Any
    urls: Any
    cves: Any
    emails: Any
    sha256: Any
    md5: Any
    ai_analysis: Any
    ai_analyzed: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ThreatDetectRequest(BaseModel):
    text: str = Field(min_length=5, description="Raw text / log / report to analyze")
    title: Optional[str] = "Manual Submission"
    run_ai: bool = True


class ThreatDetectResponse(BaseModel):
    threat_type: str
    severity: str
    mitre: str
    iocs: dict
    counts: dict
    ai_analysis: Optional[dict] = None


# ---------------------------------------------------------------------------
# Chat
# ---------------------------------------------------------------------------
class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str
    context_threats: List[int] = []


class ChatHistoryOut(BaseModel):
    id: int
    role: str
    message: str
    created_at: datetime

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Uploads
# ---------------------------------------------------------------------------
class UploadOut(BaseModel):
    id: int
    filename: str
    file_size: int
    threat_type: str
    severity: str
    mitre: str
    iocs: Any
    ai_analysis: Any
    created_at: datetime

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Admin
# ---------------------------------------------------------------------------
class ApiConfigIn(BaseModel):
    gemini_api_key: Optional[str] = None
    gemini_model: Optional[str] = None


class ApiConfigOut(BaseModel):
    gemini_api_key_set: bool
    gemini_model: str
    rss_feeds: dict


class RssFeedIn(BaseModel):
    name: str
    url: str


class ActivityLogOut(BaseModel):
    id: int
    actor: str
    role: str
    action: str
    detail: str
    created_at: datetime

    class Config:
        from_attributes = True


class DashboardStats(BaseModel):
    total_threats: int
    total_users: int
    total_uploads: int
    severity_breakdown: dict
    threat_type_breakdown: dict
    total_iocs: dict
    recent_threats: List[ThreatOut]
