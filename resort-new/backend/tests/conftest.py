
import sys
import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from datetime import datetime


PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from app.main import app as fastapi_app 
from app.db import Base, get_db

SQLALCHEMY_DATABASE_URL_TEST = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL_TEST,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

fastapi_app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db_session): 
    """
    Provides a TestClient instance with the API prefix already configured.
    """
    with TestClient(app=fastapi_app, base_url="http://testserver/api/v1") as c:
        yield c
        
@pytest.fixture(scope="function")
def auth_client(client):
    """
    Provides an authenticated TestClient instance with admin privileges
    """
    # Create an admin user for authentication
    admin_data = {
        "email": f"admin_{datetime.utcnow().timestamp()}@example.com",
        "password": "adminpassword123",
        "name": "Test Admin",
        "role": "ADMIN",
        "status": "ACTIVE"
    }
    response = client.post("/users/", json=admin_data)
    assert response.status_code == 201
    
    # Login to get token
    login_response = client.post("/token", data={
        "username": admin_data["email"],
        "password": admin_data["password"]
    })
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]
    
    # Return client with auth headers
    client.headers.update({"Authorization": f"Bearer {token}"})
    return client