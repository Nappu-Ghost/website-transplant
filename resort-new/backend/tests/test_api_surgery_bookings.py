
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app import schemas, models
from app.models import RoleEnum, StatusEnum
from datetime import datetime, date, timedelta


def create_prerequisites_for_surgery(auth_client: TestClient):
    timestamp = datetime.now().timestamp()
    doc_user_data = {"email": f"doc_surgery_{timestamp}@example.com", "password": "password123", "name": "Wellness Host User", "role": RoleEnum.DOCTOR}
    doc_user_res = auth_client.post("/users/", json=doc_user_data)
    assert doc_user_res.status_code == 201
    doc_user_id = doc_user_res.json()["id"]

    clinic_data = {"name": f"Recovery Pavilion {timestamp}", "address": "1 Lagoon Way", "surgeryRooms": 1, "opening_hours": "9AM-5PM"} 
    clinic_res = auth_client.post("/clinics/", json=clinic_data)
    assert clinic_res.status_code == 201
    clinic_id = clinic_res.json()["id"]

    doctor_data = {"specialty": "Recovery Specialist", "clinic_id": clinic_id, "user_id": doc_user_id}
    doc_res = auth_client.post("/doctors/", json=doctor_data)
    assert doc_res.status_code == 201, doc_res.json()
    doctor_id = doc_res.json()["id"]
    return doctor_id, clinic_id

def test_create_surgery_booking(auth_client: TestClient, db_session: Session):
    doctor_id, clinic_id = create_prerequisites_for_surgery(auth_client)
    booking_date = (date.today() + timedelta(days=10)).isoformat()

    booking_data = {
        "date": booking_date,
        "start_time": "09:00",
        "end_time": "11:00",
        "procedure": "Deep Tissue Ritual",
        "clinic_id": clinic_id,
        "doctor_id": doctor_id
    }
    response = auth_client.post("/surgery-bookings/", json=booking_data)
    assert response.status_code == 201, response.json()
    data = response.json()
    assert data["date"] == booking_date
    assert data["procedure"] == booking_data["procedure"]
    assert data["doctor_id"] == doctor_id
    assert "id" in data

    db_booking = db_session.get(models.SurgeryBooking, data["id"])
    assert db_booking is not None
    assert db_booking.start_time == "09:00"

def test_read_surgery_bookings_empty(auth_client: TestClient):
    # Create a unique timestamp to avoid conflicts with existing data
    timestamp = datetime.now().timestamp()
    response = auth_client.get(f"/surgery-bookings/?search={timestamp}")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_read_surgery_bookings_with_data(auth_client: TestClient):
    doc_id1, clinic_id1 = create_prerequisites_for_surgery(auth_client)
    doc_id2, clinic_id2 = create_prerequisites_for_surgery(auth_client)

    auth_client.post("/surgery-bookings/", json={"date": (date.today() + timedelta(days=11)).isoformat(), "start_time": "10:00", "end_time": "12:00", "procedure": "Ocean Ritual", "clinic_id": clinic_id1, "doctor_id": doc_id1})
    auth_client.post("/surgery-bookings/", json={"date": (date.today() + timedelta(days=12)).isoformat(), "start_time": "14:00", "end_time": "16:00", "procedure": "Lagoon Flow", "clinic_id": clinic_id2, "doctor_id": doc_id2})

    response = auth_client.get("/surgery-bookings/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2
    
def test_get_surgery_booking_by_id(auth_client: TestClient):
    doctor_id, clinic_id = create_prerequisites_for_surgery(auth_client)
    booking_date = (date.today() + timedelta(days=15)).isoformat()
    
    booking_data = {
        "date": booking_date,
        "start_time": "13:00",
        "end_time": "15:30",
        "procedure": "Skyline Ceremony",
        "clinic_id": clinic_id,
        "doctor_id": doctor_id
    }
    
    create_response = auth_client.post("/surgery-bookings/", json=booking_data)
    assert create_response.status_code == 201
    booking_id = create_response.json()["id"]
    
    get_response = auth_client.get(f"/surgery-bookings/{booking_id}")
    assert get_response.status_code == 200
    booking = get_response.json()
    assert booking["id"] == booking_id
    assert booking["date"] == booking_date
    assert booking["start_time"] == "13:00"
    assert booking["end_time"] == "15:30"
    assert booking["procedure"] == "Skyline Ceremony"

def test_update_surgery_booking(auth_client: TestClient):
    doctor_id, clinic_id = create_prerequisites_for_surgery(auth_client)
    booking_date = (date.today() + timedelta(days=20)).isoformat()
    
    # Create initial booking
    booking_data = {
        "date": booking_date,
        "start_time": "10:00",
        "end_time": "12:00",
        "procedure": "Quiet Recovery",
        "clinic_id": clinic_id,
        "doctor_id": doctor_id
    }
    
    create_response = auth_client.post("/surgery-bookings/", json=booking_data)
    assert create_response.status_code == 201
    booking_id = create_response.json()["id"]
    
    # Update the booking
    update_data = {
        "procedure": "Extended Recovery",
        "end_time": "13:00"
    }
    
    update_response = auth_client.patch(f"/surgery-bookings/{booking_id}", json=update_data)
    assert update_response.status_code == 200
    updated_booking = update_response.json()
    assert updated_booking["procedure"] == "Extended Recovery"
    assert updated_booking["end_time"] == "13:00"
    
def test_delete_surgery_booking(auth_client: TestClient, db_session: Session):
    doctor_id, clinic_id = create_prerequisites_for_surgery(auth_client)
    booking_date = (date.today() + timedelta(days=25)).isoformat()
    
    # Create booking to delete
    booking_data = {
        "date": booking_date,
        "start_time": "09:30",
        "end_time": "11:30",
        "procedure": "Restorative Session",
        "clinic_id": clinic_id,
        "doctor_id": doctor_id
    }
    
    create_response = auth_client.post("/surgery-bookings/", json=booking_data)
    assert create_response.status_code == 201
    booking_id = create_response.json()["id"]
    
    # Delete the booking
    delete_response = auth_client.delete(f"/surgery-bookings/{booking_id}")
    assert delete_response.status_code in [200, 204]
    
    # Verify the booking no longer exists
    get_response = auth_client.get(f"/surgery-bookings/{booking_id}")
    assert get_response.status_code == 404