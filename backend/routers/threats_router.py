import json
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

import models
import schemas
from auth import get_current_user_or_admin
from database import get_db
from services.ioc_engine import full_pipeline
from services.gemini_service import analyze_threat
from services.activity import log_activity
from services.settings import get_gemini_key, get_gemini_model

router = APIRouter(prefix="/api/threats", tags=["threats"])


def _serialize(threat: models.Threat) -> dict:
    d = {
        "id": threat.id,
        "source": threat.source,
        "article_title": threat.article_title,
        "url": threat.url,
        "published": threat.published,
        "content": threat.content,
        "threat_type": threat.threat_type,
        "severity": threat.severity,
        "mitre": threat.mitre,
        "ip_count": threat.ip_count,
        "domain_count": threat.domain_count,
        "url_count": threat.url_count,
        "cve_count": threat.cve_count,
        "email_count": threat.email_count,
        "sha256_count": threat.sha256_count,
        "md5_count": threat.md5_count,
        "ips": json.loads(threat.ips or "[]"),
        "domains": json.loads(threat.domains or "[]"),
        "urls": json.loads(threat.urls or "[]"),
        "cves": json.loads(threat.cves or "[]"),
        "emails": json.loads(threat.emails or "[]"),
        "sha256": json.loads(threat.sha256 or "[]"),
        "md5": json.loads(threat.md5 or "[]"),
        "ai_analysis": json.loads(threat.ai_analysis) if threat.ai_analysis else None,
        "ai_analyzed": threat.ai_analyzed,
        "created_at": threat.created_at,
    }
    return d


@router.get("", response_model=list[schemas.ThreatOut])
def list_threats(
    q: Optional[str] = Query(None, description="Keyword search across title/content"),
    threat_type: Optional[str] = None,
    severity: Optional[str] = None,
    source: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db),
    _actor=Depends(get_current_user_or_admin),
):
    query = db.query(models.Threat)
    if q:
        like = f"%{q}%"
        query = query.filter(or_(models.Threat.article_title.ilike(like),
                                  models.Threat.content.ilike(like)))
    if threat_type:
        query = query.filter(models.Threat.threat_type == threat_type)
    if severity:
        query = query.filter(models.Threat.severity == severity)
    if source:
        query = query.filter(models.Threat.source == source)

    threats = query.order_by(models.Threat.created_at.desc()).limit(limit).all()
    return [_serialize(t) for t in threats]


@router.get("/{threat_id}", response_model=schemas.ThreatOut)
def get_threat(threat_id: int, db: Session = Depends(get_db),
                _actor=Depends(get_current_user_or_admin)):
    threat = db.query(models.Threat).get(threat_id)
    if not threat:
        raise HTTPException(status_code=404, detail="Threat not found")
    return _serialize(threat)


@router.post("/{threat_id}/analyze", response_model=schemas.ThreatOut)
def analyze_existing_threat(threat_id: int, db: Session = Depends(get_db),
                             actor=Depends(get_current_user_or_admin)):
    threat = db.query(models.Threat).get(threat_id)
    if not threat:
        raise HTTPException(status_code=404, detail="Threat not found")

    api_key = get_gemini_key(db)
    model = get_gemini_model(db)
    result = analyze_threat(threat.content, title=threat.article_title,
                             api_key=api_key, model_name=model)

    threat.ai_analysis = json.dumps(result)
    threat.ai_analyzed = True
    db.commit()
    db.refresh(threat)

    actor_name = actor.username if hasattr(actor, "username") else actor["username"]
    actor_role = "admin" if not hasattr(actor, "username") else "user"
    log_activity(db, actor=actor_name, role=actor_role, action="AI_ANALYSIS",
                 detail=f"Analyzed threat #{threat.id}: {threat.article_title[:80]}")

    return _serialize(threat)


@router.post("/detect", response_model=schemas.ThreatDetectResponse)
def detect_threat(payload: schemas.ThreatDetectRequest, db: Session = Depends(get_db),
                   actor=Depends(get_current_user_or_admin)):
    """
    Threat Detection & Severity Detection module for signed-in users.
    Runs the notebook's full IOC / classification / severity / MITRE
    pipeline on arbitrary pasted text, optionally enriched with Gemini.
    """
    pipeline = full_pipeline(payload.text)

    ai_result = None
    if payload.run_ai:
        api_key = get_gemini_key(db)
        model = get_gemini_model(db)
        ai_result = analyze_threat(payload.text, title=payload.title,
                                    api_key=api_key, model_name=model)

    actor_name = actor.username if hasattr(actor, "username") else actor["username"]
    actor_role = "admin" if not hasattr(actor, "username") else "user"
    log_activity(db, actor=actor_name, role=actor_role, action="THREAT_DETECTION",
                 detail=f"Manual detection run: {payload.title[:80]} -> "
                        f"{pipeline['threat_type']} / {pipeline['severity']}")

    return schemas.ThreatDetectResponse(
        threat_type=pipeline["threat_type"],
        severity=pipeline["severity"],
        mitre=pipeline["mitre"],
        iocs=pipeline["iocs"],
        counts=pipeline["counts"],
        ai_analysis=ai_result,
    )


@router.get("/meta/sources")
def list_sources(db: Session = Depends(get_db), _actor=Depends(get_current_user_or_admin)):
    rows = db.query(models.Threat.source).distinct().all()
    return sorted({r[0] for r in rows if r[0]})
