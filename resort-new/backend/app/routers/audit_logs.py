from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app import models, schemas
from app.db import get_db
from app.dependencies import require_role

router = APIRouter(tags=["Audit Logs"], responses={404: {"description": "Not found"}})


@router.get("", response_model=List[schemas.AuditLogResponse])
@router.get("/", response_model=List[schemas.AuditLogResponse])
def list_audit_logs(
    skip: int = 0,
    limit: int = Query(default=200, ge=1, le=1000),
    action: Optional[str] = None,
    entity_type: Optional[str] = None,
    actor: Optional[str] = None,
    q: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])),
):
    query = db.query(models.AuditLog)

    if action:
        query = query.filter(models.AuditLog.action.ilike(f"%{action}%"))
    if entity_type:
        query = query.filter(models.AuditLog.entity_type.ilike(f"%{entity_type}%"))
    if actor:
        query = query.filter(models.AuditLog.actor_name.ilike(f"%{actor}%"))
    if q:
        query = query.filter(models.AuditLog.description.ilike(f"%{q}%"))

    return query.order_by(models.AuditLog.createdAt.desc()).offset(skip).limit(limit).all()
