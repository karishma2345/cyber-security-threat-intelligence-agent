import json

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_

import models
import schemas
from auth import get_current_user
from database import get_db
from services import settings as cfg
from services.ioc_engine import full_pipeline

router = APIRouter(prefix="/api/chat", tags=["chat"])


def _find_relevant_threats(db: Session, message: str, limit: int = 5):
    words = [w for w in message.lower().split() if len(w) > 3][:6]
    if not words:
        return []
    query = db.query(models.Threat)
    conditions = [models.Threat.article_title.ilike(f"%{w}%") for w in words] + \
                 [models.Threat.content.ilike(f"%{w}%") for w in words] + \
                 [models.Threat.threat_type.ilike(f"%{w}%") for w in words]
    query = query.filter(or_(*conditions))
    return query.order_by(models.Threat.created_at.desc()).limit(limit).all()


def _build_reply(message: str, threats: list) -> str:
    lower = message.lower()

    if any(g in lower for g in ["hello", "hi", "hey"]) and len(message.split()) < 4:
        return ("Hello! I'm your Threat Intelligence Assistant. Ask me about recent "
                "malware, ransomware, CVEs, IOCs, or paste a suspicious log and I'll "
                "analyze it for you.")

    if not threats:
        pipeline = full_pipeline(message)
        if any(pipeline["counts"].values()):
            ioc_bits = []
            for k, v in pipeline["iocs"].items():
                if v:
                    ioc_bits.append(f"{k}: {', '.join(v[:5])}")
            ioc_text = "; ".join(ioc_bits) if ioc_bits else "none detected"
            return (
                f"I ran your message through the threat detection pipeline. "
                f"Classified as **{pipeline['threat_type']}** with **{pipeline['severity']}** "
                f"severity (MITRE ATT&CK {pipeline['mitre']}). Extracted indicators — {ioc_text}."
            )
        return (
            "I couldn't find matching threat intelligence in the repository for that "
            "query yet. Try asking about a specific threat type (ransomware, phishing, "
            "zero-day...), a CVE ID, or paste raw log text and I'll extract IOCs and "
            "classify it directly."
        )

    lines = [f"I found {len(threats)} related item(s) in the Threat Intelligence Repository:"]
    for t in threats:
        lines.append(
            f"• **{t.article_title}** — {t.threat_type} / {t.severity} severity "
            f"(MITRE {t.mitre}), source: {t.source}."
        )
    top = threats[0]
    if top.ai_analysis:
        try:
            ai = json.loads(top.ai_analysis)
            if ai.get("executive_summary"):
                lines.append(f"\nSummary of top match: {ai['executive_summary'][:400]}")
            if ai.get("mitigation"):
                lines.append("Recommended mitigation: " + "; ".join(ai["mitigation"][:3]))
        except Exception:
            pass
    return "\n".join(lines)


@router.post("", response_model=schemas.ChatResponse)
def chat(payload: schemas.ChatRequest, db: Session = Depends(get_db),
         user: models.User = Depends(get_current_user)):
    user_msg = models.ChatMessage(user_id=user.id, role="user", message=payload.message)
    db.add(user_msg)
    db.commit()

    threats = _find_relevant_threats(db, payload.message)
    reply = _build_reply(payload.message, threats)

    bot_msg = models.ChatMessage(user_id=user.id, role="bot", message=reply)
    db.add(bot_msg)
    db.commit()

    return schemas.ChatResponse(reply=reply, context_threats=[t.id for t in threats])


@router.get("/history", response_model=list[schemas.ChatHistoryOut])
def chat_history(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    return (
        db.query(models.ChatMessage)
        .filter(models.ChatMessage.user_id == user.id)
        .order_by(models.ChatMessage.created_at.asc())
        .all()
    )


@router.delete("/history")
def clear_chat_history(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    db.query(models.ChatMessage).filter(models.ChatMessage.user_id == user.id).delete()
    db.commit()
    return {"cleared": True}
