import json
import os
import uuid

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session

import models
import schemas
from auth import get_current_user
from config import UPLOAD_DIR
from database import get_db
from services.ioc_engine import full_pipeline
from services.gemini_service import analyze_threat
from services.settings import get_gemini_key, get_gemini_model
from services.activity import log_activity

router = APIRouter(prefix="/api/uploads", tags=["uploads"])

ALLOWED_EXTENSIONS = {".txt", ".log", ".csv", ".json", ".md", ".eml"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


def _serialize(u: models.Upload) -> dict:
    return {
        "id": u.id,
        "filename": u.filename,
        "file_size": u.file_size,
        "threat_type": u.threat_type,
        "severity": u.severity,
        "mitre": u.mitre,
        "iocs": json.loads(u.iocs or "{}"),
        "ai_analysis": json.loads(u.ai_analysis) if u.ai_analysis else None,
        "created_at": u.created_at,
    }


@router.post("", response_model=schemas.UploadOut)
async def upload_file(
    file: UploadFile = File(...),
    run_ai: bool = True,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    # Sanitize the client-supplied filename: keep only the base name (no
    # directory components) so a crafted filename like "../../etc/passwd"
    # or an absolute path can't escape UPLOAD_DIR or crash the endpoint
    # with an unhandled FileNotFoundError.
    safe_filename = os.path.basename(file.filename or "")
    safe_filename = safe_filename.replace("\\", "_").strip()
    if not safe_filename or safe_filename in (".", ".."):
        raise HTTPException(status_code=400, detail="Invalid filename")

    ext = os.path.splitext(safe_filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )

    raw = await file.read()
    if len(raw) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")

    try:
        text = raw.decode("utf-8", errors="ignore")
    except Exception:
        text = ""

    stored_name = f"{uuid.uuid4().hex}_{safe_filename}"
    stored_path = os.path.join(UPLOAD_DIR, stored_name)
    # Defense in depth: make sure the resolved path is still inside UPLOAD_DIR.
    if os.path.commonpath([os.path.abspath(stored_path), os.path.abspath(UPLOAD_DIR)]) != os.path.abspath(UPLOAD_DIR):
        raise HTTPException(status_code=400, detail="Invalid filename")
    with open(stored_path, "wb") as f:
        f.write(raw)

    pipeline = full_pipeline(text)

    ai_result = None
    if run_ai:
        api_key = get_gemini_key(db)
        model = get_gemini_model(db)
        ai_result = analyze_threat(text, title=safe_filename, api_key=api_key, model_name=model)

    upload = models.Upload(
        user_id=user.id,
        filename=safe_filename,
        stored_path=stored_path,
        file_size=len(raw),
        threat_type=pipeline["threat_type"],
        severity=pipeline["severity"],
        mitre=pipeline["mitre"],
        iocs=json.dumps(pipeline["iocs"]),
        ai_analysis=json.dumps(ai_result) if ai_result else None,
    )
    db.add(upload)
    db.commit()
    db.refresh(upload)

    log_activity(db, actor=user.username, role="user", action="FILE_UPLOAD",
                 detail=f"Uploaded {safe_filename} -> {pipeline['threat_type']} / {pipeline['severity']}")

    return _serialize(upload)


@router.get("", response_model=list[schemas.UploadOut])
def list_uploads(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    uploads = (
        db.query(models.Upload)
        .filter(models.Upload.user_id == user.id)
        .order_by(models.Upload.created_at.desc())
        .all()
    )
    return [_serialize(u) for u in uploads]


@router.delete("/{upload_id}")
def delete_upload(upload_id: int, db: Session = Depends(get_db),
                   user: models.User = Depends(get_current_user)):
    upload = db.query(models.Upload).filter(
        models.Upload.id == upload_id, models.Upload.user_id == user.id
    ).first()
    if not upload:
        raise HTTPException(status_code=404, detail="Upload not found")

    if upload.stored_path and os.path.exists(upload.stored_path):
        os.remove(upload.stored_path)

    db.delete(upload)
    db.commit()
    return {"deleted": True}
