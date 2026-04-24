from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional

from app import models
from app.dependencies import get_current_active_user, require_role
from app.utils.roles import (
    ADMIN_PAGES,
    get_effective_permissions,
    get_role,
    load_roles,
    save_roles,
    slugify,
)

router = APIRouter(tags=["Roles"])


# ── Pydantic schemas ──────────────────────────────────────────────────────────

class RoleOut(BaseModel):
    id: str
    label: str
    isSystem: bool
    adminAccess: bool
    allPages: bool
    pages: List[str]


class RoleCreate(BaseModel):
    label: str
    adminAccess: bool = False
    pages: List[str] = []


class RoleUpdate(BaseModel):
    label: Optional[str] = None
    adminAccess: Optional[bool] = None
    allPages: Optional[bool] = None
    pages: Optional[List[str]] = None


class MyPermissions(BaseModel):
    adminAccess: bool
    allPages: bool
    pages: List[str]


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/my-permissions", response_model=MyPermissions)
def my_permissions(
    current_user: models.User = Depends(get_current_active_user),
):
    """Return the effective page permissions for the currently authenticated user."""
    perms = get_effective_permissions(
        current_user.role.value,
        getattr(current_user, "custom_role", None),
    )
    return perms


@router.get("", response_model=List[RoleOut])
def list_roles(
    current_user: models.User = Depends(
        require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])
    ),
):
    return load_roles()


@router.post("", response_model=RoleOut, status_code=status.HTTP_201_CREATED)
def create_role(
    payload: RoleCreate,
    current_user: models.User = Depends(require_role([models.RoleEnum.ADMIN])),
):
    roles = load_roles()

    # Validate pages
    invalid = [p for p in payload.pages if p not in ADMIN_PAGES]
    if invalid:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unknown page slug(s): {', '.join(invalid)}",
        )

    # Generate unique id
    base_id = slugify(payload.label)
    new_id = base_id
    existing_ids = {r["id"] for r in roles}
    counter = 2
    while new_id in existing_ids:
        new_id = f"{base_id}-{counter}"
        counter += 1

    new_role: dict = {
        "id": new_id,
        "label": payload.label.strip(),
        "isSystem": False,
        "adminAccess": payload.adminAccess,
        "allPages": False,
        "pages": payload.pages,
    }
    roles.append(new_role)
    save_roles(roles)
    return new_role


@router.put("/{role_id}", response_model=RoleOut)
def update_role(
    role_id: str,
    payload: RoleUpdate,
    current_user: models.User = Depends(require_role([models.RoleEnum.ADMIN])),
):
    if role_id == "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The ADMIN role cannot be modified.",
        )

    roles = load_roles()
    for role in roles:
        if role["id"] == role_id:
            if payload.label is not None:
                role["label"] = payload.label.strip()
            if payload.adminAccess is not None:
                role["adminAccess"] = payload.adminAccess
            if payload.allPages is not None and not role.get("isSystem"):
                role["allPages"] = payload.allPages
            if payload.pages is not None:
                invalid = [p for p in payload.pages if p not in ADMIN_PAGES]
                if invalid:
                    raise HTTPException(
                        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                        detail=f"Unknown page slug(s): {', '.join(invalid)}",
                    )
                role["pages"] = payload.pages
            save_roles(roles)
            return role

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found.")


@router.delete("/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_role(
    role_id: str,
    current_user: models.User = Depends(require_role([models.RoleEnum.ADMIN])),
):
    roles = load_roles()
    role = next((r for r in roles if r["id"] == role_id), None)

    if not role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found.")
    if role.get("isSystem"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Built-in roles cannot be deleted.",
        )

    save_roles([r for r in roles if r["id"] != role_id])


@router.get("/pages", response_model=List[str])
def list_pages(
    current_user: models.User = Depends(
        require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])
    ),
):
    """List all available admin page slugs."""
    return ADMIN_PAGES
