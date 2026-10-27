import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
import schemas
from auth import get_current_admin
from database import get_db
from services import settings as cfg
from services.activity import log_activity
from services.ioc_engine import full_pipeline
from services.rss_collector import collect_threat_intelligence

router = APIRouter(prefix="/api/admin", tags=["admin"])


# ---------------------------------------------------------------------------
# API Integration
# ---------------------------------------------------------------------------
@router.get("/api-config", response_model=schemas.ApiConfigOut)
def get_api_config(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    key = cfg.get_gemini_key(db)
    return schemas.ApiConfigOut(
        gemini_api_key_set=bool(key),
        gemini_model=cfg.get_gemini_model(db),
        rss_feeds=cfg.get_rss_feeds(db),
    )


@router.put("/api-config", response_model=schemas.ApiConfigOut)
def update_api_config(payload: schemas.ApiConfigIn, db: Session = Depends(get_db),
                       admin=Depends(get_current_admin)):
    if payload.gemini_api_key is not None:
        cfg.set_gemini_key(db, payload.gemini_api_key)
    if payload.gemini_model:
        cfg.set_gemini_model(db, payload.gemini_model)

    log_activity(db, actor=admin.get("sub", "Admin"), role="admin", action="API_CONFIG_UPDATE",
                 detail="Updated Gemini API integration settings")

    key = cfg.get_gemini_key(db)
    return schemas.ApiConfigOut(
        gemini_api_key_set=bool(key),
        gemini_model=cfg.get_gemini_model(db),
        rss_feeds=cfg.get_rss_feeds(db),
    )


@router.post("/api-config/rss-feed")
def add_rss_feed(payload: schemas.RssFeedIn, db: Session = Depends(get_db),
                  admin=Depends(get_current_admin)):
    feeds = cfg.get_rss_feeds(db)
    feeds[payload.name] = payload.url
    cfg.set_rss_feeds(db, feeds)
    log_activity(db, actor=admin.get("sub", "Admin"), role="admin", action="RSS_FEED_ADD",
                 detail=f"Added feed source: {payload.name}")
    return feeds


@router.delete("/api-config/rss-feed/{name}")
def remove_rss_feed(name: str, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    feeds = cfg.get_rss_feeds(db)
    feeds.pop(name, None)
    cfg.set_rss_feeds(db, feeds)
    log_activity(db, actor=admin.get("sub", "Admin"), role="admin", action="RSS_FEED_REMOVE",
                 detail=f"Removed feed source: {name}")
    return feeds


@router.post("/ingest")
def trigger_ingest(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    """Runs notebook Part 2 (RSS collection) + Part 3 (IOC/severity pipeline)
    live against the configured RSS feeds and stores new articles."""
    feeds = cfg.get_rss_feeds(db)
    raw_articles = collect_threat_intelligence(feeds=feeds)

    existing_urls = {u for (u,) in db.query(models.Threat.url).all()}
    inserted = 0

    for item in raw_articles:
        if item["URL"] in existing_urls:
            continue
        pipeline = full_pipeline(item["Content"] or item["Article_Title"])
        threat = models.Threat(
            source=item["Source"],
            article_title=item["Article_Title"],
            url=item["URL"],
            published=item["Published"],
            content=item["Content"],
            threat_type=pipeline["threat_type"],
            severity=pipeline["severity"],
            mitre=pipeline["mitre"],
            ip_count=pipeline["counts"]["ip_count"],
            domain_count=pipeline["counts"]["domain_count"],
            url_count=pipeline["counts"]["url_count"],
            cve_count=pipeline["counts"]["cve_count"],
            email_count=pipeline["counts"]["email_count"],
            sha256_count=pipeline["counts"]["sha256_count"],
            md5_count=pipeline["counts"]["md5_count"],
            ips=json.dumps(pipeline["iocs"]["IPs"]),
            domains=json.dumps(pipeline["iocs"]["Domains"]),
            urls=json.dumps(pipeline["iocs"]["URLs"]),
            cves=json.dumps(pipeline["iocs"]["CVEs"]),
            emails=json.dumps(pipeline["iocs"]["Emails"]),
            sha256=json.dumps(pipeline["iocs"]["SHA256"]),
            md5=json.dumps(pipeline["iocs"]["MD5"]),
        )
        db.add(threat)
        existing_urls.add(item["URL"])
        inserted += 1

    db.commit()

    log_activity(db, actor=admin.get("sub", "Admin"), role="admin", action="RSS_INGEST",
                 detail=f"Collected {len(raw_articles)} articles, inserted {inserted} new threats")

    return {"collected": len(raw_articles), "inserted": inserted}


# ---------------------------------------------------------------------------
# User Management
# ---------------------------------------------------------------------------
@router.get("/users", response_model=list[schemas.UserOut])
def list_users(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    return db.query(models.User).order_by(models.User.created_at.desc()).all()


@router.patch("/users/{user_id}/toggle-active", response_model=schemas.UserOut)
def toggle_user_active(user_id: int, db: Session = Depends(get_db),
                        admin=Depends(get_current_admin)):
    user = db.query(models.User).get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)

    log_activity(db, actor=admin.get("sub", "Admin"), role="admin", action="USER_TOGGLE_ACTIVE",
                 detail=f"{'Enabled' if user.is_active else 'Disabled'} user {user.username}")
    return user


@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    user = db.query(models.User).get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    username = user.username
    db.delete(user)
    db.commit()

    log_activity(db, actor=admin.get("sub", "Admin"), role="admin", action="USER_DELETE",
                 detail=f"Deleted user {username}")
    return {"deleted": True}


# ---------------------------------------------------------------------------
# History Analysis
# ---------------------------------------------------------------------------
@router.get("/history", response_model=list[schemas.ActivityLogOut])
def get_history(limit: int = 200, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    return (
        db.query(models.ActivityLog)
        .order_by(models.ActivityLog.created_at.desc())
        .limit(limit)
        .all()
    )


@router.get("/history/summary")
def history_summary(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    from sqlalchemy import func
    rows = (
        db.query(models.ActivityLog.action, func.count(models.ActivityLog.id))
        .group_by(models.ActivityLog.action)
        .all()
    )
    return {action: count for action, count in rows}
