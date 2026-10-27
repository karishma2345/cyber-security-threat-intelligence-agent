import json
from collections import Counter

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import models
import schemas
from auth import get_current_user_or_admin
from database import get_db

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=schemas.DashboardStats)
def dashboard_stats(db: Session = Depends(get_db), _actor=Depends(get_current_user_or_admin)):
    threats = db.query(models.Threat).all()
    total_threats = len(threats)
    total_users = db.query(models.User).count()
    total_uploads = db.query(models.Upload).count()

    severity_breakdown = dict(Counter(t.severity for t in threats))
    threat_type_breakdown = dict(Counter(t.threat_type for t in threats))

    total_iocs = {
        "IPs": sum(t.ip_count for t in threats),
        "Domains": sum(t.domain_count for t in threats),
        "URLs": sum(t.url_count for t in threats),
        "CVEs": sum(t.cve_count for t in threats),
        "Emails": sum(t.email_count for t in threats),
        "SHA256": sum(t.sha256_count for t in threats),
        "MD5": sum(t.md5_count for t in threats),
    }

    recent = (
        db.query(models.Threat)
        .order_by(models.Threat.created_at.desc())
        .limit(8)
        .all()
    )

    def ser(t):
        return {
            "id": t.id, "source": t.source, "article_title": t.article_title,
            "url": t.url, "published": t.published, "content": t.content,
            "threat_type": t.threat_type, "severity": t.severity, "mitre": t.mitre,
            "ip_count": t.ip_count, "domain_count": t.domain_count, "url_count": t.url_count,
            "cve_count": t.cve_count, "email_count": t.email_count,
            "sha256_count": t.sha256_count, "md5_count": t.md5_count,
            "ips": json.loads(t.ips or "[]"), "domains": json.loads(t.domains or "[]"),
            "urls": json.loads(t.urls or "[]"), "cves": json.loads(t.cves or "[]"),
            "emails": json.loads(t.emails or "[]"), "sha256": json.loads(t.sha256 or "[]"),
            "md5": json.loads(t.md5 or "[]"),
            "ai_analysis": json.loads(t.ai_analysis) if t.ai_analysis else None,
            "ai_analyzed": t.ai_analyzed, "created_at": t.created_at,
        }

    return schemas.DashboardStats(
        total_threats=total_threats,
        total_users=total_users,
        total_uploads=total_uploads,
        severity_breakdown=severity_breakdown,
        threat_type_breakdown=threat_type_breakdown,
        total_iocs=total_iocs,
        recent_threats=[ser(t) for t in recent],
    )
