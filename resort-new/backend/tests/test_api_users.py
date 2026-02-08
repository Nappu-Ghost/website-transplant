
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app import schemas, models, crud 
from app.models import RoleEnum, StatusEnum
from datetime import datetime


def unique_email(base="user"):
    return f"{base}_{datetime.now().timestamp()}@example.com"

def test_create_user(auth_client: TestClient, db_session: Session):
    user_data = {
        "email": unique_email("testcreate"),
        "password": "testpassword123",
        "name": "Test User Create",
        "role": "CUSTOMER",
        "status": "ACTIVE"
    }
    response = auth_client.post("/users/", json=user_data)
    assert response.status_code == 201, response.json()
    data = response.json()
    assert data["email"] == user_data["email"]
    assert data["name"] == user_data["name"]
    assert data["role"] == user_data["role"]
    assert data["status"] == user_data["status"]
    assert "id" in data
    assert "password" not in data
    assert "createdAt" in data
    assert "updatedAt" in data

    db_user = db_session.get(models.User, data["id"]) 
    assert db_user is not None
    assert db_user.email == user_data["email"]

def test_create_user_duplicate_email(auth_client: TestClient):
    email = unique_email("duplicate")
    user_data = {
        "email": email, 
        "password": "password123", 
        "name": "First User",
        "role": "CUSTOMER",
        "status": "ACTIVE"
    }
    response1 = auth_client.post("/users/", json=user_data)
    assert response1.status_code == 201

    user_data2 = {
        "email": email, 
        "password": "password456", 
        "name": "Second User",
        "role": "CUSTOMER",
        "status": "ACTIVE"
    }
    response2 = auth_client.post("/users/", json=user_data2)
    assert response2.status_code == 400
    assert "email already" in response2.json()["detail"].lower()

def test_read_users_empty(auth_client: TestClient, db_session: Session):
    # Clear all users except the auth user
    auth_user_id = None
    for user in auth_client.get("/users/").json():
        if user["email"].startswith("admin_"):
            auth_user_id = user["id"]
            break
            
    if auth_user_id:
        users_to_delete = db_session.query(models.User).filter(models.User.id != auth_user_id).all()
        for user in users_to_delete:
            db_session.delete(user)
        db_session.commit()
    
    response = auth_client.get("/users/")
    assert response.status_code == 200
    # There should be at least the auth user
    assert len(response.json()) >= 1

def test_read_users_with_data(auth_client: TestClient):
    user1_email = unique_email("user1")
    user2_email = unique_email("user2")
    res1 = auth_client.post("/users/", json={
        "email": user1_email, 
        "password": "password123", 
        "name": "User One", 
        "role": "CUSTOMER", 
        "status": "ACTIVE"
    })
    assert res1.status_code == 201, res1.json()
    
    res2 = auth_client.post("/users/", json={
        "email": user2_email, 
        "password": "password123", 
        "name": "User Two", 
        "role": "DOCTOR", 
        "status": "ACTIVE"
    })
    assert res2.status_code == 201, res2.json()

    response = auth_client.get("/users/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 3  # The two new users plus the auth user
    emails_in_response = [u["email"] for u in data]
    assert user1_email in emails_in_response
    assert user2_email in emails_in_response
    assert user2_email in emails_in_response


def test_read_user(auth_client: TestClient):
    user_email = unique_email("readsingle")
    create_response = auth_client.post("/users/", json={
        "email": user_email, 
        "password": "password123", 
        "name": "Single User",
        "role": "CUSTOMER",
        "status": "ACTIVE"
    })
    assert create_response.status_code == 201
    user_id = create_response.json()["id"]

    response = auth_client.get(f"/users/{user_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == user_id
    assert data["email"] == user_email
    assert data["name"] == "Single User"
    assert data["role"] == "CUSTOMER"
    assert data["status"] == "ACTIVE"
    assert "createdAt" in data
    assert "updatedAt" in data

def test_read_user_not_found(auth_client: TestClient):
    response = auth_client.get("/users/99999")
    assert response.status_code == 404

def test_update_user_put(auth_client: TestClient):
    original_email = unique_email("put_orig")
    create_response = auth_client.post("/users/", json={
        "email": original_email, 
        "password": "original_password", 
        "name": "Original Name", 
        "role": "CUSTOMER",
        "status": "ACTIVE"
    })
    assert create_response.status_code == 201
    user_id = create_response.json()["id"]

    updated_email = unique_email("put_updated")
    put_data = {
        "email": updated_email,
        "password": "new_strong_password",
        "name": "Updated Name",
        "role": "MANAGER",
        "status": "INACTIVE"
    }
    response = auth_client.put(f"/users/{user_id}", json=put_data)
    assert response.status_code == 200, response.json()
    data = response.json()
    assert data["email"] == updated_email
    assert data["name"] == "Updated Name"
    assert data["role"] == "MANAGER"
    assert data["status"] == "INACTIVE"
    assert "updatedAt" in data

def test_update_user_patch(auth_client: TestClient, db_session: Session):
    original_email = unique_email("patch_orig")
    create_response = auth_client.post("/users/", json={
        "email": original_email, 
        "password": "original_password", 
        "name": "Patch Original", 
        "role": "CUSTOMER",
        "status": "ACTIVE"
    })
    assert create_response.status_code == 201
    user_id = create_response.json()["id"]

    patch_data = {
        "name": "Patched Name", 
        "status": "INACTIVE",
        "role": "ADMINISTRATIVE_OFFICER"
    }
    response = auth_client.patch(f"/users/{user_id}", json=patch_data)
    assert response.status_code == 200, response.json()
    data = response.json()
    assert data["name"] == "Patched Name"
    assert data["status"] == "INACTIVE"
    assert data["email"] == original_email

    db_user = db_session.get(models.User, user_id) 
    assert db_user is not None
    assert db_user.name == "Patched Name"

def test_update_user_patch_change_password(auth_client: TestClient, db_session: Session):
    email = unique_email("patch_pw")
    create_response = auth_client.post("/users/", json={
        "email": email, 
        "password": "old_password", 
        "name": "Password Change User",
        "role": "CUSTOMER",
        "status": "ACTIVE"
    })
    assert create_response.status_code == 201, create_response.json() 
    user_id = create_response.json()["id"]

    patch_data = {"password": "new_secure_password123"}
    response = auth_client.patch(f"/users/{user_id}", json=patch_data)
    assert response.status_code == 200, response.json()

    db_user = db_session.get(models.User, user_id) 
    assert db_user is not None
    assert crud.verify_password("new_secure_password123", db_user.hashed_password) 
    assert not crud.verify_password("old_password", db_user.hashed_password) 

def test_delete_user(auth_client: TestClient, db_session: Session):
    email = unique_email("delete_user")
    create_response = auth_client.post("/users/", json={
        "email": email, 
        "password": "password_del", 
        "name": "User To Delete",
        "role": "CUSTOMER",
        "status": "ACTIVE"
    })
    assert create_response.status_code == 201
    user_id = create_response.json()["id"]

    delete_response = auth_client.delete(f"/users/{user_id}")
    assert delete_response.status_code in [200, 204]
    if delete_response.status_code == 200:
        assert delete_response.json()["id"] == user_id

    db_user_after_delete = db_session.get(models.User, user_id) 
    assert db_user_after_delete is None

    get_response = auth_client.get(f"/users/{user_id}")
    assert get_response.status_code == 404

def test_delete_user_not_found(auth_client: TestClient):
    response = auth_client.delete("/users/99988")
    assert response.status_code == 404