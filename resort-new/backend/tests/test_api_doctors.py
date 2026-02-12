from fastapi.testclient import TestClient
from datetime import datetime
from app import models 
from app.models import RoleEnum, StatusEnum 
from sqlalchemy.orm import Session 

def create_prerequisites_for_doctor(auth_client: TestClient):
    timestamp_ms = int(datetime.now().timestamp() * 10000) 

    clinic_data = {
        "name": f"Host Pavilion {timestamp_ms}",
        "address": "123 Lagoon Way",
        "phone": "555-1234",
        "opening_hours": "9am-5pm",
        "image_url": "https://example.com/pavilion.jpg"
    }
    clinic_response = auth_client.post("/clinics/", json=clinic_data)
    if clinic_response.status_code != 201:
        print("Clinic creation failed in prerequisite for doctor:", clinic_response.json())
    assert clinic_response.status_code == 201
    clinic_id = clinic_response.json()["id"]

    user_data = {
        "email": f"doc_user_{timestamp_ms}@example.com",
        "password": "testpassword123",
        "name": "Test Host User",
        "role": RoleEnum.DOCTOR.value, 
        "status": StatusEnum.ACTIVE.value
    }
    user_response = auth_client.post("/users/", json=user_data)
    if user_response.status_code != 201:
         print("User creation failed in prerequisite for doctor:", user_response.json())
    assert user_response.status_code == 201
    user_id = user_response.json()["id"]

    return user_id, clinic_id


def test_create_doctor(auth_client: TestClient, db_session: Session):
    user_id, clinic_id = create_prerequisites_for_doctor(auth_client)
    
    doctor_data = {
        "specialty": "Wellness Guide",
        "clinic_id": clinic_id,
        "user_id": user_id,
        "status": StatusEnum.ACTIVE.value
    }
    
    response = auth_client.post("/doctors/", json=doctor_data)
    assert response.status_code == 201, response.json()
    
    doctor = response.json()
    assert doctor["specialty"] == doctor_data["specialty"]
    assert doctor["clinic_id"] == clinic_id
    assert doctor["user_id"] == user_id
    assert doctor["status"] == StatusEnum.ACTIVE
    assert "id" in doctor
    assert "user" in doctor
    assert "clinic" in doctor
    
    # Check that the doctor exists in the database
    db_doctor = db_session.query(models.Doctor).filter(models.Doctor.id == doctor["id"]).first()
    assert db_doctor is not None
    assert db_doctor.specialty == doctor_data["specialty"]


def test_create_doctor_with_new_user(auth_client: TestClient, db_session: Session):
    _, clinic_id = create_prerequisites_for_doctor(auth_client)
    timestamp_ms = int(datetime.now().timestamp() * 10000) 
    
    doctor_data = {
        "specialty": "Movement Coach",
        "clinic_id": clinic_id,
        "user_email": f"new_doc_{timestamp_ms}@example.com",
        "user_name": "New Host User",
        "user_password": "securepassword123",
        "status": StatusEnum.ACTIVE.value
    }
    
    response = auth_client.post("/doctors/", json=doctor_data)
    assert response.status_code == 201, response.json()
    
    doctor = response.json()
    assert doctor["specialty"] == doctor_data["specialty"]
    assert doctor["clinic_id"] == clinic_id
    assert "user_id" in doctor
    assert doctor["status"] == StatusEnum.ACTIVE
    assert "id" in doctor
    assert "user" in doctor
    assert doctor["user"]["email"] == doctor_data["user_email"]
    assert doctor["user"]["name"] == doctor_data["user_name"]
    assert doctor["user"]["role"] == RoleEnum.DOCTOR.value


def test_get_doctors(auth_client: TestClient):
    user_id, clinic_id = create_prerequisites_for_doctor(auth_client)
    
    # Create a doctor
    doctor_data = {
        "specialty": "Wellness Guide",
        "clinic_id": clinic_id,
        "user_id": user_id,
        "status": StatusEnum.ACTIVE.value
    }
    
    create_response = auth_client.post("/doctors/", json=doctor_data)
    assert create_response.status_code == 201
    
    # Get all doctors
    response = auth_client.get("/doctors/")
    assert response.status_code == 200
    
    doctors = response.json()
    assert len(doctors) > 0
    
    # Check if our created doctor is in the list
    created_doctor_id = create_response.json()["id"]
    found = False
    for doctor in doctors:
        if doctor["id"] == created_doctor_id:
            found = True
            assert doctor["specialty"] == doctor_data["specialty"]
            assert doctor["clinic_id"] == clinic_id
            assert doctor["user_id"] == user_id
            break
            
    assert found, "Created doctor not found in the list"


def test_get_doctor_by_id(auth_client: TestClient):
    user_id, clinic_id = create_prerequisites_for_doctor(auth_client)
    
    # Create a doctor
    doctor_data = {
        "specialty": "Family Wellness",
        "clinic_id": clinic_id,
        "user_id": user_id,
        "status": StatusEnum.ACTIVE.value
    }
    
    create_response = auth_client.post("/doctors/", json=doctor_data)
    assert create_response.status_code == 201
    created_doctor_id = create_response.json()["id"]
    
    # Get the doctor by ID
    response = auth_client.get(f"/doctors/{created_doctor_id}")
    assert response.status_code == 200
    
    doctor = response.json()
    assert doctor["id"] == created_doctor_id
    assert doctor["specialty"] == doctor_data["specialty"]
    assert doctor["clinic_id"] == clinic_id
    assert doctor["user_id"] == user_id
    assert "user" in doctor
    assert "clinic" in doctor


def test_update_doctor(auth_client: TestClient):
    user_id, clinic_id = create_prerequisites_for_doctor(auth_client)
    
    # Create a doctor
    doctor_data = {
        "specialty": "Recovery Therapy",
        "clinic_id": clinic_id,
        "user_id": user_id,
        "status": StatusEnum.ACTIVE.value
    }
    
    create_response = auth_client.post("/doctors/", json=doctor_data)
    assert create_response.status_code == 201
    created_doctor_id = create_response.json()["id"]
    
    # Update the doctor
    update_data = {
        "specialty": "Ocean Therapy",
        "status": StatusEnum.INACTIVE.value
    }
    
    response = auth_client.patch(f"/doctors/{created_doctor_id}", json=update_data)
    assert response.status_code == 200
    
    updated_doctor = response.json()
    assert updated_doctor["id"] == created_doctor_id
    assert updated_doctor["specialty"] == update_data["specialty"]
    assert updated_doctor["status"] == update_data["status"]
    assert updated_doctor["clinic_id"] == clinic_id
    assert updated_doctor["user_id"] == user_id


def test_delete_doctor(auth_client: TestClient, db_session: Session):
    user_id, clinic_id = create_prerequisites_for_doctor(auth_client)
    
    # Create a doctor
    doctor_data = {
        "specialty": "Holistic Care",
        "clinic_id": clinic_id,
        "user_id": user_id,
        "status": StatusEnum.ACTIVE.value
    }
    
    create_response = auth_client.post("/doctors/", json=doctor_data)
    assert create_response.status_code == 201
    created_doctor_id = create_response.json()["id"]
    
    # Delete the doctor
    response = auth_client.delete(f"/doctors/{created_doctor_id}")
    assert response.status_code in [200, 204]
    
    if response.status_code == 200:
        deleted_doctor = response.json()
        assert deleted_doctor["id"] == created_doctor_id
    
    # Try to get the deleted doctor
    get_response = auth_client.get(f"/doctors/{created_doctor_id}")
    assert get_response.status_code == 404