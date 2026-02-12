
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app import schemas, models 
from datetime import datetime 


def unique_clinic_name(base="Pavilion"):
    return f"{base} {datetime.now().timestamp()}"

def test_create_clinic(auth_client: TestClient, db_session: Session):
    clinic_name = unique_clinic_name("TestAlpha")
    clinic_data = {
        "name": clinic_name,
        "address": "123 Test St, Testville",
        "phone": "555-0101",
        "opening_hours": "9am-5pm",
        "image_url": "https://example.com/pavilion.jpg",
        "rooms": 5,
        "beds": 10,
        "surgeryRooms": 2,
        "status": "ACTIVE"
    }
    response = auth_client.post("/clinics/", json=clinic_data) 
    assert response.status_code == 201, response.json()
    data = response.json()
    assert data["name"] == clinic_data["name"]
    assert data["address"] == clinic_data["address"]
    assert data["phone"] == clinic_data["phone"]
    assert data["opening_hours"] == clinic_data["opening_hours"]
    assert data["image_url"] == clinic_data["image_url"]
    assert "id" in data

    db_clinic = db_session.get(models.Clinic, data["id"]) 
    assert db_clinic is not None
    assert db_clinic.name == clinic_data["name"]

def test_create_clinic_duplicate_name(auth_client: TestClient):
    clinic_name = unique_clinic_name("Duplicate")
    clinic_data = {
        "name": clinic_name,
        "address": "Addr 1",
        "phone": "555-0202",
        "opening_hours": "8am-6pm"
    }
    response1 = auth_client.post("/clinics/", json=clinic_data)
    assert response1.status_code == 201
    response2 = auth_client.post("/clinics/", json=clinic_data)
    assert response2.status_code == 400
    assert "already registered" in response2.json()["detail"].lower()


def test_read_clinic(auth_client: TestClient, db_session: Session):
    clinic_name = unique_clinic_name("Beta")
    clinic_data = {
        "name": clinic_name,
        "address": "456 Beta Rd",
        "phone": "555-0303",
        "opening_hours": "9am-7pm",
        "image_url": "https://example.com/lagoon-villa.jpg"
    }
    create_response = auth_client.post("/clinics/", json=clinic_data)
    assert create_response.status_code == 201
    created_clinic_id = create_response.json()["id"]

    response = auth_client.get(f"/clinics/{created_clinic_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == clinic_data["name"]
    assert data["phone"] == clinic_data["phone"]
    assert data["opening_hours"] == clinic_data["opening_hours"]
    assert data["image_url"] == clinic_data["image_url"]
    assert data["id"] == created_clinic_id

def test_read_clinic_not_found(client: TestClient):
    response = client.get("/clinics/99999")
    assert response.status_code == 404

def test_read_clinics_empty(client: TestClient, db_session: Session):
    # Clear all clinics from test DB
    db_session.query(models.Clinic).delete()
    db_session.commit()
    
    response = client.get("/clinics/")
    assert response.status_code == 200
    assert response.json() == []

def test_read_clinics_with_data(auth_client: TestClient):
    gamma_name = unique_clinic_name("Gamma")
    delta_name = unique_clinic_name("Delta")

    auth_client.post("/clinics/", json={ 
        "name": gamma_name, 
        "address": "Gamma Ave",
        "phone": "555-1234",
        "opening_hours": "9am-5pm"
    })
    auth_client.post("/clinics/", json={ 
        "name": delta_name, 
        "address": "Delta St",
        "phone": "555-5678",
        "opening_hours": "10am-6pm"
    })

    response = auth_client.get("/clinics/")
    assert response.status_code == 200
    data = response.json()
    names_in_response = [c["name"] for c in data]
    assert gamma_name in names_in_response
    assert delta_name in names_in_response


def test_update_clinic_put(auth_client: TestClient):
    clinic_name_orig = unique_clinic_name("Epsilon")
    clinic_data = { 
        "name": clinic_name_orig, 
        "address": "Epsilon Blvd", 
        "phone": "555-0102",
        "opening_hours": "9am-5pm"
    }
    create_response = auth_client.post("/clinics/", json=clinic_data)
    assert create_response.status_code == 201
    created_clinic_id = create_response.json()["id"]

    clinic_name_updated = unique_clinic_name("EpsilonUpdated")
    updated_data = {
        "name": clinic_name_updated,
        "address": "New Epsilon Address",
        "phone": "555-9999",
        "opening_hours": "24/7", 
        "image_url": "https://example.com/updated-pavilion.jpg",
        "rooms": 3, 
        "beds": 6, 
        "surgeryRooms": 1, 
        "status": "INACTIVE"
    }
    response = auth_client.put(f"/clinics/{created_clinic_id}", json=updated_data)
    assert response.status_code == 200, response.json()
    data = response.json()
    assert data["name"] == updated_data["name"]
    assert data["address"] == updated_data["address"]
    assert data["phone"] == updated_data["phone"]
    assert data["opening_hours"] == updated_data["opening_hours"]
    assert data["image_url"] == updated_data["image_url"]
    assert data["status"] == "INACTIVE"

def test_update_clinic_put_not_found(auth_client: TestClient):
    updated_data = { 
        "name": "NonExistent", 
        "address": "No Where", 
        "phone": "555-0000", 
        "opening_hours":"24/7", 
        "rooms":1, 
        "beds":1, 
        "surgeryRooms":1, 
        "status":"ACTIVE"
    }
    response = auth_client.put("/clinics/88888", json=updated_data)
    assert response.status_code == 404


def test_update_clinic_patch(auth_client: TestClient, db_session: Session):
    clinic_name_orig = unique_clinic_name("Zeta")
    clinic_data = { 
        "name": clinic_name_orig, 
        "address": "Zeta Lane", 
        "phone": "555-0103",
        "opening_hours": "9am-5pm"
    }
    create_response = auth_client.post("/clinics/", json=clinic_data)
    assert create_response.status_code == 201
    created_clinic_id = create_response.json()["id"]

    patch_data = {
        "name": unique_clinic_name("ZetaPatched"), 
        "status": "INACTIVE",
        "phone": "555-9876",
        "image_url": "https://example.com/patched-image.jpg" 
    }
    response = auth_client.patch(f"/clinics/{created_clinic_id}", json=patch_data)
    assert response.status_code == 200, response.json()
    data = response.json()
    assert data["name"] == patch_data["name"]
    assert data["address"] == clinic_data["address"]
    assert data["phone"] == patch_data["phone"]  
    assert data["image_url"] == patch_data["image_url"]
    assert data["status"] == "INACTIVE"

def test_update_clinic_patch_not_found(auth_client: TestClient):
    patch_data = {
        "name": "NonExistent Patched",
        "phone": "555-1111",
        "opening_hours": "Updated hours"
    }
    response = auth_client.patch("/clinics/77777", json=patch_data)
    assert response.status_code == 404

def test_delete_clinic(auth_client: TestClient, db_session: Session):
    clinic_name = unique_clinic_name("Eta")
    clinic_data = { 
        "name": clinic_name, 
        "address": "Eta Street",
        "phone": "555-1234", 
        "opening_hours": "9am-5pm"
    }
    create_response = auth_client.post("/clinics/", json=clinic_data)
    assert create_response.status_code == 201
    created_clinic_id = create_response.json()["id"]

    get_response_before = auth_client.get(f"/clinics/{created_clinic_id}")
    assert get_response_before.status_code == 200

    delete_response = auth_client.delete(f"/clinics/{created_clinic_id}")
    assert delete_response.status_code == 200
    assert delete_response.json()["id"] == created_clinic_id

    get_response_after = auth_client.get(f"/clinics/{created_clinic_id}")
    assert get_response_after.status_code == 404