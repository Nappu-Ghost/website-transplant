
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app import schemas, models
from datetime import datetime

def unique_service_name(base="Service"):
    return f"{base} {datetime.now().timestamp()}"

def test_create_service(auth_client: TestClient, db_session: Session):
    service_data = {
        "name": unique_service_name("Cleaning"),
        "description": "Standard dental cleaning",
        "price_morning": 75.0,
        "price_afternoon": 70.0,
        "price_evening": 80.0,
        "icon_url": "https://example.com/cleaning.png",
        "includes": "Teeth cleaning, dental assessment, polishing",
        "status": "ACTIVE"
    }
    response = auth_client.post("/services/", json=service_data)
    assert response.status_code == 201, response.json()
    data = response.json()
    assert data["name"] == service_data["name"]
    assert data["description"] == service_data["description"]
    assert data["price_morning"] == service_data["price_morning"]
    assert data["price_afternoon"] == service_data["price_afternoon"] 
    assert data["price_evening"] == service_data["price_evening"]
    assert data["icon_url"] == service_data["icon_url"]
    assert data["includes"] == service_data["includes"]
    assert "id" in data

    db_service = db_session.get(models.Service, data["id"])
    assert db_service is not None
    assert db_service.name == service_data["name"]

def test_create_service_duplicate_name(auth_client: TestClient):
    name = unique_service_name("UniqueServ")
    service_data = {
        "name": name, 
        "price_morning": 10, 
        "price_afternoon": 10, 
        "price_evening": 10,
        "description": "Test service"
    }
    response1 = auth_client.post("/services/", json=service_data)
    assert response1.status_code == 201

    response2 = auth_client.post("/services/", json=service_data) 
    assert response2.status_code == 400
    assert "already exists" in response2.json()["detail"].lower() or "already registered" in response2.json()["detail"].lower()

def test_read_services_empty(client: TestClient, db_session: Session):
    # We can use non-auth client for GET operations
    # Clear the services table first
    db_session.query(models.Service).delete()
    db_session.commit()
    
    response = client.get("/services/")
    assert response.status_code == 200
    assert response.json() == []

def test_read_services_with_data(auth_client: TestClient):
    auth_client.post("/services/", json={
        "name": unique_service_name("S1"), 
        "price_morning": 50, 
        "price_afternoon": 45, 
        "price_evening": 60, 
        "description": "Service One"
    })
    auth_client.post("/services/", json={
        "name": unique_service_name("S2"), 
        "price_morning": 70, 
        "price_afternoon": 65, 
        "price_evening": 80,
        "description": "Service Two", 
        "icon_url": "https://example.com/service2.png",
        "includes": "Full checkup, cleaning"
    })

    response = auth_client.get("/services/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2

def test_read_service(auth_client: TestClient):
    name = unique_service_name("ReadSingle")
    create_response = auth_client.post("/services/", json={
        "name": name, 
        "price_morning": 30, 
        "price_afternoon": 35, 
        "price_evening": 40,
        "description": "Read Single Service"
    })
    assert create_response.status_code == 201
    service_id = create_response.json()["id"]

    response = auth_client.get(f"/services/{service_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == service_id
    assert data["name"] == name

def test_read_service_not_found(auth_client: TestClient):
    response = auth_client.get("/services/99999")
    assert response.status_code == 404

def test_update_service_put(auth_client: TestClient):
    name = unique_service_name("PutOrig")
    create_response = auth_client.post("/services/", json={
        "name": name, 
        "description": "Original", 
        "price_morning": 40.0, 
        "price_afternoon": 45.0, 
        "price_evening": 50.0
    })
    service_id = create_response.json()["id"]

    put_data = {
        "name": unique_service_name("PutUpdated"),
        "description": "Updated Description",
        "price_morning": 60.0,
        "price_afternoon": 55.0,
        "price_evening": 65.0,
        "icon_url": "https://example.com/updated.png",
        "includes": "Advanced cleaning, checkup",
        "status": "INACTIVE"
    }
    response = auth_client.put(f"/services/{service_id}", json=put_data)
    assert response.status_code == 200, response.json()
    data = response.json()
    assert data["name"] == put_data["name"]
    assert data["description"] == put_data["description"]
    assert data["price_morning"] == put_data["price_morning"]
    assert data["price_afternoon"] == put_data["price_afternoon"]
    assert data["price_evening"] == put_data["price_evening"]
    assert data["icon_url"] == put_data["icon_url"]
    assert data["includes"] == put_data["includes"]
    assert data["status"] == "INACTIVE"

def test_update_service_patch(auth_client: TestClient, db_session: Session):
    name = unique_service_name("PatchOrig")
    create_response = auth_client.post("/services/", json={
        "name": name, 
        "description": "Patch Original", 
        "price_morning": 50.0, 
        "price_afternoon": 55.0, 
        "price_evening": 60.0
    })
    service_id = create_response.json()["id"]

    patch_data = {
        "description": "Patched Description", 
        "price_evening": 75.5,
        "includes": "Basic cleaning"
    }
    response = auth_client.patch(f"/services/{service_id}", json=patch_data)
    assert response.status_code == 200, response.json()
    data = response.json()
    assert data["description"] == "Patched Description"
    assert data["price_evening"] == 75.5
    assert data["includes"] == "Basic cleaning"
    assert data["name"] == name 

    db_service = db_session.get(models.Service, service_id)
    assert db_service.description == "Patched Description"
    assert db_service.includes == "Basic cleaning"

def test_delete_service(auth_client: TestClient, db_session: Session):
    name = unique_service_name("DeleteServ")
    create_response = auth_client.post("/services/", json={
        "name": name, 
        "price_morning": 60.0, 
        "price_afternoon": 65.0, 
        "price_evening": 70.0,
        "description": "Service to delete"
    })
    service_id = create_response.json()["id"]

    delete_response = auth_client.delete(f"/services/{service_id}")
    assert delete_response.status_code in [200, 204]
    
    if delete_response.status_code == 200:
        assert delete_response.json()["id"] == service_id

    db_service_after = db_session.get(models.Service, service_id)
    assert db_service_after is None

    get_response = auth_client.get(f"/services/{service_id}")
    assert get_response.status_code == 404
    assert get_response.status_code == 404

def test_delete_service_not_found(auth_client: TestClient):
    response = auth_client.delete("/services/99988")
    assert response.status_code == 404