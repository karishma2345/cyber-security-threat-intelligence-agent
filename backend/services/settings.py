import json

from sqlalchemy.orm import Session

import models
from config import GEMINI_MODEL_NAME, RSS_FEEDS

KEY_GEMINI_API_KEY = "gemini_api_key"
KEY_GEMINI_MODEL = "gemini_model"
KEY_RSS_FEEDS = "rss_feeds"


def _get(db: Session, key: str, default: str = "") -> str:
    row = db.query(models.AdminConfig).filter(models.AdminConfig.key == key).first()
    return row.value if row else default


def _set(db: Session, key: str, value: str):
    row = db.query(models.AdminConfig).filter(models.AdminConfig.key == key).first()
    if row:
        row.value = value
    else:
        row = models.AdminConfig(key=key, value=value)
        db.add(row)
    db.commit()


def get_gemini_key(db: Session) -> str:
    return _get(db, KEY_GEMINI_API_KEY, "")


def set_gemini_key(db: Session, value: str):
    _set(db, KEY_GEMINI_API_KEY, value or "")


def get_gemini_model(db: Session) -> str:
    return _get(db, KEY_GEMINI_MODEL, GEMINI_MODEL_NAME)


def set_gemini_model(db: Session, value: str):
    _set(db, KEY_GEMINI_MODEL, value or GEMINI_MODEL_NAME)


def get_rss_feeds(db: Session) -> dict:
    raw = _get(db, KEY_RSS_FEEDS, "")
    if not raw:
        return dict(RSS_FEEDS)
    try:
        return json.loads(raw)
    except Exception:
        return dict(RSS_FEEDS)


def set_rss_feeds(db: Session, feeds: dict):
    _set(db, KEY_RSS_FEEDS, json.dumps(feeds))
