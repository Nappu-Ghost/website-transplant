from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app import schemas, models
from datetime import datetime, timedelta


def create_prerequisites_for_appointment(auth_client: TestClient):
    timestamp = datetime.now().timestamp()
    
    # Create customer
    customer_data = {
        "email": f"cust_appt_{timestamp}@example.com", 
        "password": "password123", 
        "name": "Appt Customer",
        "role": "CUSTOMER",
        "status": "ACTIVE"
    }
    cust_res = auth_client.post("/users/", json=customer_data)
    assert cust_res.status_code == 201
    customer_id = cust_res.json()["id"]

    # Create clinic
    clinic_data = {
        "name": f"Appt Clinic {timestamp}", 
        "address": "1 Appt St",
        "phone": "555-1234",
        "opening_hours": "9am-5pm"
    }
    clinic_res = auth_client.post("/clinics/", json=clinic_data)
    assert clinic_res.status_code == 201
    clinic_id = clinic_res.json()["id"]

    # Create service
    service_data = {
        "name": f"Appt Service {timestamp}", 
        "price_morning": 50, 
        "price_afternoon": 50, 
        "price_evening": 50,
        "description": "Test Service"
    }
    service_res = auth_client.post("/services/", json=service_data)
    assert service_res.status_code == 201
    service_id = service_res.json()["id"]

    # Create doctor user
    doc_user_data = {
        "email": f"doc_appt_{timestamp}@example.com", 
        "password": "password123", 
        "name": "Appt Doctor User", 
        "role": "DOCTOR",
        "status": "ACTIVE"
    }
    doc_user_res = auth_client.post("/users/", json=doc_user_data)
    assert doc_user_res.status_code == 201
    doc_user_id = doc_user_res.json()["id"]
    
    # Create doctor
    doctor_data = {
        "specialty": "General", 
        "clinic_id": clinic_id, 
        "user_id": doc_user_id,
        "status": "ACTIVE"
    }
    doc_res = auth_client.post("/doctors/", json=doctor_data)
    assert doc_res.status_code == 201
    doctor_id = doc_res.json()["id"]
    
    return customer_id, clinic_id, service_id, doctor_id

def test_create_appointment(auth_client: TestClient, db_session: Session):
    customer_id, clinic_id, service_id, doctor_id = create_prerequisites_for_appointment(auth_client)
    
    appointment_data = {
        "appointment_time": (datetime.utcnow() + timedelta(days=5)).isoformat(),
        "price": 75.00,
        "notes": "Regular checkup",
        "status": "SCHEDULED",
        "customer_id": customer_id,
        "clinic_id": clinic_id,
        "service_id": service_id,
        "doctor_id": doctor_id
    }
    response = auth_client.post("/appointments/", json=appointment_data)
    assert response.status_code == 201, response.json()
    data = response.json()
    assert data["customer_id"] == customer_id
    assert data["clinic_id"] == clinic_id
    assert data["service_id"] == service_id
    assert data["doctor_id"] == doctor_id
    assert data["price"] == 75.00
    assert data["notes"] == "Regular checkup"
    assert data["status"] == "SCHEDULED"
    assert "id" in data
    assert "bookingReference" in data

    db_appt = db_session.get(models.Appointment, data["id"])
    assert db_appt is not None
    assert db_appt.price == 75.00

def test_read_appointments(auth_client: TestClient):
    customer_id, clinic_id, service_id, doctor_id = create_prerequisites_for_appointment(auth_client)
    
    # Create an appointment first
    appointment_data = {
        "appointment_time": (datetime.utcnow() + timedelta(days=7)).isoformat(),
        "price": 80.00,
        "notes": "Follow-up checkup",
        "status": "SCHEDULED",
        "customer_id": customer_id,
        "clinic_id": clinic_id,
        "service_id": service_id,
        "doctor_id": doctor_id
    }
    create_response = auth_client.post("/appointments/", json=appointment_data)
    assert create_response.status_code == 201
    
    # Get all appointments
    response = auth_client.get("/appointments/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    
    # Check if our created appointment is in the list
    created_appointment_id = create_response.json()["id"]
    found = False
    for appt in data:
        if appt["id"] == created_appointment_id:
            found = True
            assert appt["price"] == 80.00
            assert appt["customer_id"] == customer_id
            assert appt["service_id"] == service_id
            break
    
    assert found, "Created appointment not found in the list"


def test_get_appointment_by_id(auth_client: TestClient):
    customer_id, clinic_id, service_id, doctor_id = create_prerequisites_for_appointment(auth_client)
    
    # Create an appointment
    appointment_data = {
        "appointment_time": (datetime.utcnow() + timedelta(days=10)).isoformat(),
        "price": 85.00,
        "notes": "Regular checkup",
        "status": "SCHEDULED",
        "customer_id": customer_id,
        "clinic_id": clinic_id,
        "service_id": service_id,
        "doctor_id": doctor_id
    }
    create_response = auth_client.post("/appointments/", json=appointment_data)
    assert create_response.status_code == 201
    created_appointment_id = create_response.json()["id"]
    
    # Get the appointment by ID
    response = auth_client.get(f"/appointments/{created_appointment_id}")
    assert response.status_code == 200
    
    appointment = response.json()
    assert appointment["id"] == created_appointment_id
    assert appointment["price"] == 85.00
    assert appointment["notes"] == "Regular checkup"
    assert appointment["customer_id"] == customer_id
    assert appointment["clinic_id"] == clinic_id
    assert appointment["service_id"] == service_id
    assert appointment["doctor_id"] == doctor_id


def test_get_appointment_not_found(auth_client: TestClient):
    response = auth_client.get("/appointments/99999")
    assert response.status_code == 404


def test_update_appointment(auth_client: TestClient):
    customer_id, clinic_id, service_id, doctor_id = create_prerequisites_for_appointment(auth_client)
    
    # Create an appointment
    appointment_data = {
        "appointment_time": (datetime.utcnow() + timedelta(days=15)).isoformat(),
        "price": 90.00,
        "notes": "Initial consultation",
        "status": "SCHEDULED",
        "customer_id": customer_id,
        "clinic_id": clinic_id,
        "service_id": service_id,
        "doctor_id": doctor_id
    }
    create_response = auth_client.post("/appointments/", json=appointment_data)
    assert create_response.status_code == 201
    created_appointment_id = create_response.json()["id"]
    
    # Update the appointment
    update_data = {
        "notes": "Updated notes with additional instructions",
        "status": "COMPLETED",
        "price": 95.50
    }
    
    response = auth_client.patch(f"/appointments/{created_appointment_id}", json=update_data)
    assert response.status_code == 200
    
    updated_appt = response.json()
    assert updated_appt["id"] == created_appointment_id
    assert updated_appt["notes"] == update_data["notes"]
    assert updated_appt["status"] == update_data["status"]
    assert updated_appt["price"] == update_data["price"]
    assert updated_appt["customer_id"] == customer_id  # These should remain unchanged
    assert updated_appt["clinic_id"] == clinic_id
    assert updated_appt["service_id"] == service_id
    assert updated_appt["doctor_id"] == doctor_id


def test_cancel_appointment(auth_client: TestClient, db_session: Session):
    customer_id, clinic_id, service_id, doctor_id = create_prerequisites_for_appointment(auth_client)
    
    # Create an appointment
    appointment_data = {
        "appointment_time": (datetime.utcnow() + timedelta(days=20)).isoformat(),
        "price": 100.00,
        "notes": "Routine checkup",
        "status": "SCHEDULED",
        "customer_id": customer_id,
        "clinic_id": clinic_id,
        "service_id": service_id,
        "doctor_id": doctor_id
    }
    create_response = auth_client.post("/appointments/", json=appointment_data)
    assert create_response.status_code == 201
    created_appointment_id = create_response.json()["id"]
    
    # Cancel the appointment (using PATCH to update status to CANCELLED)
    cancel_data = {"status": "CANCELLED"}
    response = auth_client.patch(f"/appointments/{created_appointment_id}", json=cancel_data)
    assert response.status_code == 200
    
    cancelled_appt = response.json()
    assert cancelled_appt["id"] == created_appointment_id
    assert cancelled_appt["status"] == "CANCELLED"
    
    # Verify the status was updated in the database
    db_appt = db_session.get(models.Appointment, created_appointment_id)
    assert db_appt is not None
    assert db_appt.status == models.AppointmentStatusEnum.CANCELLED


def test_delete_appointment(auth_client: TestClient, db_session: Session):
    customer_id, clinic_id, service_id, doctor_id = create_prerequisites_for_appointment(auth_client)
    
    # Create an appointment
    appointment_data = {
        "appointment_time": (datetime.utcnow() + timedelta(days=25)).isoformat(),
        "price": 105.00,
        "notes": "Final checkup",
        "status": "SCHEDULED",
        "customer_id": customer_id,
        "clinic_id": clinic_id,
        "service_id": service_id,
        "doctor_id": doctor_id
    }
    create_response = auth_client.post("/appointments/", json=appointment_data)
    assert create_response.status_code == 201
    created_appointment_id = create_response.json()["id"]
    
    # Delete the appointment
    delete_response = auth_client.delete(f"/appointments/{created_appointment_id}")
    assert delete_response.status_code in [200, 204]
    
    if delete_response.status_code == 200:
        deleted_appointment = delete_response.json()
        assert deleted_appointment["id"] == created_appointment_id
    
    # Check that the appointment is actually deleted
    get_response = auth_client.get(f"/appointments/{created_appointment_id}")
    assert get_response.status_code == 404
    
    # Check that it's not in the database
    db_appt = db_session.get(models.Appointment, created_appointment_id)
    assert db_appt is None