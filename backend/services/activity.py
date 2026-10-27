from sqlalchemy.orm import Session

import models


def log_activity(db: Session, actor: str, role: str, action: str, detail: str = ""):
    entry = models.ActivityLog(actor=actor, role=role, action=action, detail=detail)
    db.add(entry)
    db.commit()
