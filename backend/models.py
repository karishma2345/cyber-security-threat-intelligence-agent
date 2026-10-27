from datetime import datetime

from sqlalchemy import (
    Column, Integer, String, Text, DateTime, Boolean, ForeignKey
)
from sqlalchemy.orm import relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(80), unique=True, index=True, nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    full_name = Column(String(120), default="")
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="user")  # "user" | "admin"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    uploads = relationship("Upload", back_populates="owner", cascade="all, delete-orphan")
    chats = relationship("ChatMessage", back_populates="owner", cascade="all, delete-orphan")


class Threat(Base):
    __tablename__ = "threats"

    id = Column(Integer, primary_key=True, index=True)
    source = Column(String(120), index=True)
    article_title = Column(Text)
    url = Column(Text)
    published = Column(String(80), default="")
    content = Column(Text)

    threat_type = Column(String(60), index=True, default="Other")
    severity = Column(String(20), index=True, default="Low")
    mitre = Column(String(20), default="Unknown")

    ip_count = Column(Integer, default=0)
    domain_count = Column(Integer, default=0)
    url_count = Column(Integer, default=0)
    cve_count = Column(Integer, default=0)
    email_count = Column(Integer, default=0)
    sha256_count = Column(Integer, default=0)
    md5_count = Column(Integer, default=0)

    ips = Column(Text, default="[]")        # JSON encoded list
    domains = Column(Text, default="[]")
    urls = Column(Text, default="[]")
    cves = Column(Text, default="[]")
    emails = Column(Text, default="[]")
    sha256 = Column(Text, default="[]")
    md5 = Column(Text, default="[]")

    ai_analysis = Column(Text, default=None)  # JSON encoded Gemini result
    ai_analyzed = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)


class Upload(Base):
    __tablename__ = "uploads"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    filename = Column(String(255))
    stored_path = Column(String(500))
    file_size = Column(Integer, default=0)

    threat_type = Column(String(60), default="Other")
    severity = Column(String(20), default="Low")
    mitre = Column(String(20), default="Unknown")
    iocs = Column(Text, default="{}")  # JSON encoded extract_iocs() output
    ai_analysis = Column(Text, default=None)

    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="uploads")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    role = Column(String(10))  # "user" | "bot"
    message = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="chats")


class AdminConfig(Base):
    __tablename__ = "admin_config"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(80), unique=True, index=True)
    value = Column(Text, default="")


class ActivityLog(Base):
    """Powers the Admin > History Analysis module."""
    __tablename__ = "activity_log"

    id = Column(Integer, primary_key=True, index=True)
    actor = Column(String(80))          # username
    role = Column(String(20))           # admin | user
    action = Column(String(120))        # e.g. "LOGIN", "RSS_INGEST", "AI_ANALYSIS"
    detail = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
